const Generator = require('yeoman-generator');
var optionOrPrompt = require('yeoman-option-or-prompt');
const chalk = require('chalk');
const _ = require('lodash');
const nodeFs = require('fs');
const utils = require('../text-utils');
const check = require('../check-utils');
const path = require('path');

const MASTER = 'master';
const MASTER_DETAIL = 'master/detail'

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('documentName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.modulePath = function(name) {
            return this.contextRoot + (name ? ('\\' + name) : '');
        }

        this.libraryPath = function(name) {
            return this.modulePath(this.properties.libraryName) + (name ? ('\\' + name) : '');
        }

        this.componentsPath = function(name) {
            return this.modulePath(this.properties.componentsName) + (name ? ('\\' + name) : '');
        }

        this.addToInterface = function(contents) {
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: '#include "D' + this.properties.documentName +'.h"\n' +
                                  '#include "UI' + this.properties.documentName +'.hjson"\n',
                    justBefore: '#ifdef _DEBUG'
                },{
                    textToInsert: '\tBEGIN_DOCUMENT (_NS_DOC("' + this.properties.documentName + '"), TPL_NO_PROTECTION)\n' + 
                                        '\t\tREGISTER_MASTER_JSON_TEMPLATE(szDefaultViewMode,	D' + this.properties.documentName + ',	IDD_' + _.toUpper(this.properties.documentName) + ')\n' +
                                        '\t\tREGISTER_BKGROUND_TEMPLATE	(szBackgroundViewMode,	D' + this.properties.documentName + ')\n' +
                                  '\tEND_DOCUMENT ()\n',
                    justBefore: 'END_TEMPLATE'
                }]
            );
        }

        this.addToProj = function(contents, source, libDependency) {
            var actions =  [{
                textToInsert: '<ClCompile Include="' + source + '.cpp" />\n',
                justBefore: '<ClCompile Include='
            },{
                textToInsert: '<ClInclude Include="' + source + '.h" />\n',
                justBefore: '<ClInclude Include='
            }];
            if (libDependency) {
                actions = actions.concat(
                    [{
                        textToInsert: this.properties.dblName + '.lib;',
                        justBefore: '%(AdditionalDependencies)',
                        skipIfAlreadyPresent: true,
                        allOccurrencies: true
                    },{
                        textToInsert: this.properties.componentsName + '.lib;',
                        justBefore: '%(AdditionalDependencies)',
                        skipIfAlreadyPresent: true,
                        allOccurrencies: true
                    }]
                );
            }
            return utils.insertInSource(
                contents.toString(),
                actions
            );
        }

        this.addDocumentObjects = function(contents, source) {
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: '\t<Document namespace="'+ this.properties.appName + '.' + this.properties.moduleName + '.' + this.properties.libraryName + '.' + this.properties.documentName + '" localize="' + this.properties.documentTitle + '" classhierarchy="D' + this.properties.documentName + '">\n' +
                                  '\t\t<InterfaceClass>ADM' + this.properties.documentName + 'Obj</InterfaceClass>\n' +
                                  '\t\t<ViewModes>\n' +
                                  '\t\t\t<Mode name="Default" />\n' +
                                  '\t\t\t<Mode name="BackGround" />\n' +
                                  '\t\t</ViewModes>\n' +
                                  '\t</Document>\n',
                    justBefore: '</Documents>'
                }]
            );
        }
    }

    initializing() {
        var appRoot = path.dirname(path.dirname(this.contextRoot));
        if (!_.toLower(appRoot).endsWith('\\standard\\applications')) {
            this.env.error("Current folder must be a module of a TaskBuilder Application  (<your instance>\\Standard\\Applications\\<your app>\\<your module>).");
        }
        this.options.moduleName = path.basename(this.contextRoot);
        this.options.appName = path.basename(path.dirname(this.contextRoot));
    }

    prompting() {
        this.log('Welcome to the ' + chalk.red('TBLegacy Document') + ' generator!');
        this.log('You are about to add a document to the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        const prompts = [ {
            name: 'documentName',
            message: 'What is your document name ?',
            default: this.options.documentName,
            validate: (input, answers) => { return check.validNewFSName("Document", this.contextRoot + "\\ModuleObjects", input, "\\Description\\Document.xml" ); }
        },{
            name: 'libraryName',
            message: 'Which is the hosting library ?',
            default: this.options.moduleName + 'Documents',
            validate: (input, answers) => { return check.validExistingFSName("Library", this.contextRoot, input); }
        },{
            type: 'list',
            name: 'documentType',
            message: 'Which kind of document you want:',
            choices: [MASTER, MASTER_DETAIL],
            default: MASTER
        },{
            name: 'documentTitle',
            message: 'Set the main form title',
            default: (answers) => { return (this.options.documentName || answers.documentName) + ' document' }
        },{
            name: 'dblName',
            message: 'Which library contains the table definition ?',
            default: this.options.moduleName + 'Dbl',
            validate: (input, answers) => { return check.validExistingFSName("Library", this.contextRoot, input); }
        },{
            name: 'tableName',
            message: 'Which is the master table?',
            default: (answers) => { return 'T' + answers.documentName },
            validate: (input, answers) => { return check.validExistingFSName("Table", this.contextRoot+ "\\" + answers.dblName , input, ".h"); }
        },{
            name: 'tablePhisicalName',
            message: 'What is the master table phisical name?',
            default: (answers) => { return utils.extractPhisicalName(this.contextRoot + "\\" + answers.dblName, answers.tableName); },
            validate: (input, answers) => { return check.validExistingFSName("Table", this.contextRoot + "\\DatabaseScript\\Create\\All" , input, ".sql"); }
        },{
            name: 'componentsName',
            message: 'Which library will contain the ADM definition ?',
            default: this.options.moduleName + 'Components',
            validate: (input, answers) => { return check.validExistingFSName("Library", this.contextRoot, input); }
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;
            this.properties.appName = this.options.appName;
            this.properties.moduleName = this.options.moduleName;
    
            this.properties.tableBaseName = (this.properties.tableName[0] == 'T') ? 
                                            this.properties.tableName.substring(1) : 
                                            this.properties.tableName;
        });
    }

    writing() {
        if (this.properties.documentType === MASTER) {
            var template = '_master';
        } else {
            var template = '_master_detail';
        }
        // ADM
        this.fs.copyTpl(
            this.templatePath('_components\\_adm.h'),
            this.componentsPath('ADM' + this.properties.documentName + '.h'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath('_components\\_adm.cpp'),
            this.componentsPath('ADM' + this.properties.documentName + '.cpp'),
            this.properties
        );
        this.fs.copy(
            this.componentsPath(this.properties.componentsName + '.vcxproj'),
            this.componentsPath(this.properties.componentsName + '.vcxproj'),
            { process: (contents) => { return this.addToProj(contents, 'ADM' + this.properties.documentName); } }
        );

        //Document
        this.fs.copyTpl(
            this.templatePath('_library\\' + template + '\\_document.h'),
            this.libraryPath('D' + this.properties.documentName + '.h'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath('_library\\' + template + '\\_document.cpp'),
            this.libraryPath('D' + this.properties.documentName + '.cpp'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath('_library\\' + template + '\\_document.hjson'),
            this.libraryPath('UI' + this.properties.documentName + '.hjson'),
            this.properties
        );
        this.fs.copy(
            this.libraryPath(this.properties.libraryName + 'Interface.cpp'),
            this.libraryPath(this.properties.libraryName + 'Interface.cpp'),
            { process: (contents) => { return this.addToInterface(contents); } }
        );
        this.fs.copy(
            this.libraryPath(this.properties.libraryName + '.vcxproj'),
            this.libraryPath(this.properties.libraryName + '.vcxproj'),
            { process: (contents) => { return this.addToProj(contents, 'D' + this.properties.documentName, true); } }
        );

        // Module Objects
        this.fs.copyTpl(
            this.templatePath('ModuleObjects\\' + template + '\\_document\\'),
            this.modulePath('ModuleObjects\\' + this.properties.documentName),
            this.properties
        );

        this.fs.move(
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD.hjson'),
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_' + _.toUpper(this.properties.documentName) + '.hjson')
        );
        this.fs.move(
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD.tbjson'),
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_' + _.toUpper(this.properties.documentName) + '.tbjson')
        );

        this.fs.move(
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_MAIN.hjson'),
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_TD_' + _.toUpper(this.properties.documentName) + '_MAIN.hjson')
        );
        this.fs.move(
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_MAIN.tbjson'),
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_TD_' + _.toUpper(this.properties.documentName) + '_MAIN.tbjson')
        );
        
        this.fs.move(
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_VIEW.hjson'),
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_' + _.toUpper(this.properties.documentName) + '_VIEW.hjson')
        );
        this.fs.move(
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_VIEW.tbjson'),
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_' + _.toUpper(this.properties.documentName) + '_VIEW.tbjson')
        );

        this.fs.copy(
            this.modulePath('ModuleObjects\\DocumentObjects.xml'),
            this.modulePath('ModuleObjects\\DocumentObjects.xml'),
            { process: (contents) => { return this.addDocumentObjects(contents); } }
        );

    }
}