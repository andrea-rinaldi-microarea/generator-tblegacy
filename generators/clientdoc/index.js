const Generator = require('yeoman-generator');
var optionOrPrompt = require('yeoman-option-or-prompt');
const chalk = require('chalk');
const _ = require('lodash');
const nodeFs = require('fs');
const utils = require('../text-utils');
const check = require('../check-utils');
const path = require('path');

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('clientDocName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.modulePath = function(name) {
            return this.contextRoot + (name ? ('\\' + name) : '');
        }

        this.libraryPath = function(name) {
            return this.modulePath(this.properties.libraryName) + (name ? ('\\' + name) : '');
        }

        this.addToInterface = function(contents) {
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: '#include "CD' + this.properties.clientDocName +'.h"\n',
                    justBefore: '#ifdef _DEBUG'
                },{
                    textToInsert: '\WHEN_SERVER_DOC (D' + this.properties.serverDocName + ')\n' + 
                                        '\t\tATTACH_CLIENT_DOC(CD' + this.properties.clientDocName + ',	_NS_CD("CD' + this.properties.clientDocName + '"))\n' +
                                  '\END_SERVER_DOC ()\n',
                    justBefore: 'END_CLIENT_DOC'
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
                        textToInsert: this.properties.serverLibraryName + '.lib;',
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

        this.addClientDocumentObjects = function(contents, source) {
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: '\t<ServerDocument namespace="'+ this.properties.serverAppName + '.' + this.properties.serverModuleName + '.' + this.properties.serverLibraryName + '.' + this.properties.serverDocName  + '" >\n' +
                                  '\t\t<ClientDocument namespace="' + this.properties.appName + '.' + this.properties.moduleName + '.' + this.properties.libraryName + '.' + this.properties.clientDocName + '" localize="' + this.properties.clientDocDescription + '" >\n' +
                                  '\t</ServerDocument>\n',
                    justBefore: '</ClientDocuments>'
                }]
            );
        }
    }

    initializing() {
        if (typeof this.options.sourceRoot !== "undefined" && this.options.sourceRoot !== "")
            this.sourceRoot(this.options.sourceRoot);

        var appRoot = path.dirname(path.dirname(this.contextRoot));
        if (!_.toLower(appRoot).endsWith('\\standard\\applications')) {
            this.env.error("Current folder must be a module of a TaskBuilder Application  (<your instance>\\Standard\\Applications\\<your app>\\<your module>).");
        }
        this.options.appRoot = appRoot;
        this.options.moduleName = path.basename(this.contextRoot);
        this.options.appName = path.basename(path.dirname(this.contextRoot));
    }

    prompting() {
        this.log('Welcome to the ' + chalk.red('TBLegacy Client Document') + ' generator!');
        this.log('You are about to create a Client Document in the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        const prompts = [ {
            name: 'clientDocName',
            message: 'What is your Client Document name ?',
            default: this.options.clientDocName,
            validate: (input, answers) => { return check.validNewFSName("Client Document", this.contextRoot + "\\ModuleObjects", input); }
        },{
            name: 'libraryName',
            message: 'Which is the hosting library ?',
            default: this.options.moduleName + 'AddOns',
            validate: (input, answers) => { return check.validExistingFSName("Library", this.contextRoot, input); }
        },{
            name: 'clientDocDescription',
            message: 'Set the Client Document description',
            default: (answers) => { return (this.options.clientDocName || answers.clientDocName) + ' client document' }
        },{
            name: 'serverAppName',
            message: 'Which application contains the document to extend ?',
            default: this.options.appName,
            validate: (input, answers) => { return check.validExistingFSName("Application", this.options.appRoot, input, "\\Application.config"); }
        },{
            name: 'serverModuleName',
            message: 'Which module of the external application?',
            default: this.options.moduleName,
            validate: (input, answers) => { return check.validExistingFSName("Module", this.options.appRoot + "\\" + answers.serverAppName , input, "\\Module.config"); }
        },{
            name: 'serverLibraryName',
            message: 'Which library ?',
            default: this.options.moduleName + 'Documents',
            validate: (input, answers) => { return check.validExistingFSName("Library", this.options.appRoot + "\\" + answers.serverAppName + "\\" + answers.serverModuleName, input); }
        },{
            name: 'serverDocName',
            message: 'Which document ?',
            default: this.options.serverDocName,
            validate: (input, answers) => { return check.validExistingFSName("Document", this.options.appRoot + "\\" + answers.serverAppName + "\\" + answers.serverModuleName + "\\ModuleObjects", input, "\\Description\\Document.xml" ); }
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;
            this.properties.appName = this.options.appName;
            this.properties.moduleName = this.options.moduleName;
        });
    }

    writing() {
        //Client Document
        this.fs.copyTpl(
            this.templatePath('_library\\_clientdoc.h'),
            this.libraryPath('CD' + this.properties.clientDocName + '.h'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath('_library\\_clientdoc.cpp'),
            this.libraryPath('CD' + this.properties.clientDocName + '.cpp'),
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
            { process: (contents) => { return this.addToProj(contents, 'CD' + this.properties.clientDocName, true); } }
        );

        // Module Objects
        this.fs.copy(
            this.modulePath('ModuleObjects\\ClientDocumentObjects.xml'),
            this.modulePath('ModuleObjects\\ClientDocumentObjects.xml'),
            { process: (contents) => { return this.addClientDocumentObjects(contents); } }
        );

    }
}