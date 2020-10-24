/*
generator-tblegacy - scaffolding of TB Legacy C++ applications 
Copyright (C) 2017 Microarea s.p.a.
This program is free software: you can redistribute it and/or modify it under the 
terms of the GNU General Public License as published by the Free Software Foundation, 
either version 3 of the License, or (at your option) any later version.
This program is distributed in the hope that it will be useful, 
but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
or FITNESS FOR A PARTICULAR PURPOSE. 
See the GNU General Public License for more details.
*/

const Generator = require('yeoman-generator');
var optionOrPrompt = require('yeoman-option-or-prompt');
const chalk = require('chalk');
const _ = require('lodash');
const nodeFs = require('fs');
const utils = require('../text-utils');
const check = require('../check-utils');
const path = require('path');
const snippet = require('../snippet-utils');

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

        this.snippetPath = function() {
            return path.normalize(path.join(this.sourceRoot(), '../snippets'));
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

        this.addDocumentObjects = function(contents) {
            var documentObjects  = this.properties.codeless ? 'documentObjects-CL.xml' : 'documentObjects.xml';
                
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: snippet.render(path.join(this.snippetPath(), documentObjects), this.properties),
                    justBefore: '</Documents>'
                }],
                utils.XML_CONTENT
            );
        }

        this.addToMenu = function(contents) {
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: snippet.render(path.join(this.snippetPath(),'_module.menu'), this.properties), 
                    justBefore: '</Menu>'
                }],
                utils.XML_CONTENT
            );
        }

        this.extractPhisicalName = function(path, className) {
            var res = utils.extractInfo(path + "\\" + className + '.cpp', '_NS_TBL("', '");');
            if (res === false) {
                return className;
            }
            return res;
        }
    
    }

    initializing() {
        if (typeof this.options.sourceRoot !== "undefined" && this.options.sourceRoot !== "")
            this.sourceRoot(this.options.sourceRoot);

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
            type: 'confirm',
            name: 'codeless',
            message: 'Is it a codeless document?',
            default: false
        },{
            name: 'libraryName',
            message: 'Which is the hosting library ?',
            default: this.options.moduleName + 'Documents',
            validate: (input, answers) => { return check.validExistingFSName("Library", this.contextRoot, input); },
            when: (answers) => { return !answers.codeless; }
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
            validate: (input, answers) => { return check.validExistingFSName("Library", this.contextRoot, input); },
            when: (answers) => { return !answers.codeless; }
        },{
            name: 'tableName',
            message: 'Which is the master table?',
            default: (answers) => { return 'T' + answers.documentName },
            validate: (input, answers) => { return check.validExistingFSName("Table", this.contextRoot+ "\\" + answers.dblName , input, ".h"); },
            when: (answers) => { return !answers.codeless; }
        },{
            name: 'tablePhisicalName',
            message: 'What is the master table phisical name?',
            default: (answers) => { return this.extractPhisicalName(this.contextRoot + "\\" + answers.dblName, answers.tableName); },
            validate: (input, answers) => { return check.validExistingFSName("Table", this.contextRoot + "\\DatabaseScript\\Create\\All" , input, ".sql"); }
        },{
            name: 'componentsName',
            message: 'Which library will contain the ADM definition ?',
            default: this.options.moduleName + 'Components',
            validate: (input, answers) => { return check.validExistingFSName("Library", this.contextRoot, input); },
            when: (answers) => { return !answers.codeless; }
        },{
            type: 'confirm',
            name: 'defaultUI',
            message: 'Scaffold some default UI (Y) or start with empty UI (n)?',
            default: true
        },{
            type: 'confirm',
            name: 'HKLGeneration',
            message: 'Do you want to generate the Hotlink for it?',
            default: true,
            when: (answers) => { return answers.codeless; }
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;
            this.properties.appName = this.options.appName;
            this.properties.moduleName = this.options.moduleName;
    
            if (!this.properties.codeless) {
                this.properties.tableBaseName = (this.properties.tableName[0] == 'T') ? 
                this.properties.tableName.substring(1) : 
                this.properties.tableName;
            }

            if (this.properties.codeless) {
                this.properties.libraryName = 'codeless'; 
                this.properties.dblName = 'codeless'; 
                this.properties.dynamic = 'dynamic="true"';
            }
            this.properties.documentNamespace = this.properties.appName + '.' + this.properties.moduleName + '.' + this.properties.libraryName + '.' + this.properties.documentName;                                
            this.properties.MASTER = MASTER;
            this.properties.MASTER_DETAIL = MASTER_DETAIL;
        });
    }

    writing() {
        if (this.properties.documentType === MASTER) {
            var template = '_master';
        } else {
            var template = '_master_detail';
        }
        if (!this.properties.codeless) {
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
        }

        // Module Objects
        this.fs.copyTpl(
            this.templatePath('ModuleObjects\\' + template + '\\_document\\'),
            this.modulePath('ModuleObjects\\' + this.properties.documentName),
            this.properties
        );

        this.fs.move(
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD.tbjson'),
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_' + _.toUpper(this.properties.documentName) + '.tbjson')
        );
        this.fs.move(
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_MAIN.tbjson'),
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_TD_' + _.toUpper(this.properties.documentName) + '_MAIN.tbjson')
        );
        this.fs.move(
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_VIEW.tbjson'),
            this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_' + _.toUpper(this.properties.documentName) + '_VIEW.tbjson')
        );

        if (!this.properties.codeless) {
            this.fs.move(
                this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD.hjson'),
                this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_' + _.toUpper(this.properties.documentName) + '.hjson')
            );
            this.fs.move(
                this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_MAIN.hjson'),
                this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_TD_' + _.toUpper(this.properties.documentName) + '_MAIN.hjson')
            );
            this.fs.move(
                this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_VIEW.hjson'),
                this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_' + _.toUpper(this.properties.documentName) + '_VIEW.hjson')
            );
        } else {
            this.fs.delete(this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD.hjson'));
            this.fs.delete(this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_MAIN.hjson'));
            this.fs.delete(this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_VIEW.hjson'));
        }

        if (this.properties.documentType === MASTER_DETAIL) {
            this.fs.move(
                this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_DETAIL.tbjson'),
                this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_TD_' + _.toUpper(this.properties.documentName) + '_DETAIL.tbjson')
            );
            if (!this.properties.codeless) {
                this.fs.move(
                    this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_DETAIL.hjson'),
                    this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\IDD_TD_' + _.toUpper(this.properties.documentName) + '_DETAIL.hjson')
                );
            } else {
                this.fs.delete(this.modulePath('ModuleObjects\\' + this.properties.documentName + '\\JsonForms\\_IDD_DETAIL.hjson'));
            }
        }

        this.fs.copy(
            this.modulePath('ModuleObjects\\DocumentObjects.xml'),
            this.modulePath('ModuleObjects\\DocumentObjects.xml'),
            { process: (contents) => { return this.addDocumentObjects(contents); } }
        );

        //Reference Objects
        if (this.properties.HKLGeneration) {
            this.fs.copyTpl(
                this.templatePath('ReferenceObjects\\_document.xml'),
                this.modulePath('ReferenceObjects\\' + this.properties.documentName + '.xml'),
                this.properties
            );            
        }

        this.fs.copy(
            this.modulePath('Menu\\' + this.properties.moduleName + '.menu'),
            this.modulePath('Menu\\' + this.properties.moduleName + '.menu'),
            { process: (contents) => { return this.addToMenu(contents); } }
        );
    }
}