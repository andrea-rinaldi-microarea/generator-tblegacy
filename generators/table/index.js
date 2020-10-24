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
const utils = require('../text-utils');
const check = require('../check-utils');
const path = require('path');
const snippet = require('../snippet-utils');

const MASTER = 'master';
const MASTER_DETAIL = 'master/detail'
const SLAVE = 'slave'

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('tableName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.addToCreateInfo = function(contents) {
            var lastStep = contents.toString().split('</Level1>')[0].lastIndexOf('numstep="');
            var numStep = (lastStep != -1) ? contents.toString().split('</Level1>')[0].substring(lastStep).split('"')[1] : "0";
            this.properties['numStep'] = _.parseInt(numStep) + 1;

            var actions = [{
                textToInsert: `<Step numstep="${this.properties.numStep}" script="${this.properties.tableName}.sql" />\n`,
                justBefore: '</Level1>'
            }];
            if (this.properties.tableType === MASTER_DETAIL) {
                actions.push({
                    textToInsert: `<Step numstep="${this.properties.numStep + 1}" script="${this.properties.tableName}Details.sql" />\n`,
                    justBefore: '</Level1>'
                });
            }

            return utils.insertInSource(
                contents.toString(), 
                actions,
                utils.XML_CONTENT
            );
        }
    
        this.addToInterface = function(contents) {
            var actions = [{
                textToInsert: '#include "' + this.properties.tableClassName +'.h"\n',
                justBefore: '\n#ifdef _DEBUG'
            },{
                textToInsert: 'REGISTER_TABLE		(' + this.properties.tableClassName + ')\n',
                justBefore: 'END_REGISTER_TABLES'
            }];
            if (this.properties.tableType === MASTER_DETAIL) {
                actions = actions.concat(
                    [{
                        textToInsert: 'REGISTER_TABLE		(' + this.properties.tableClassName + 'Details)\n',
                        justBefore: 'END_REGISTER_TABLES'
                    }]
                );
            }
            return utils.insertInSource(
                contents.toString(), 
                actions
            );
        }

        this.addToProj = function(contents) {
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: '<ClCompile Include="' + this.properties.tableClassName + '.cpp" />\n',
                    justBefore: '<ClCompile Include='
                },{
                    textToInsert: '<ClInclude Include="' + this.properties.tableClassName + '.h" />\n',
                    justBefore: '<ClInclude Include='
                }]
            );
        }

        this.snippetPath = function() {
            return path.normalize(path.join(this.sourceRoot(), '../snippets'));
        }

        this.addToDatabaseObjects = function(template, contents) {
            var actions = [{
                textToInsert: snippet.render(path.join(this.snippetPath(), template, 'databaseObjects.xml'), this.properties), 
                justBefore: '</Tables>'
            }];
            return utils.insertInSource(
                contents.toString(), 
                actions,
                utils.XML_CONTENT
            );
        }

        this.addToEFSchemaObjects = function(template, contents) {
            var actions = [{
                textToInsert: snippet.render(path.join(this.snippetPath(), template, 'efSchemaObjects.xml'), this.properties), 
                justBefore: '</Tables>'
            }];

            return utils.insertInSource(
                contents.toString(), 
                actions,
                utils.XML_CONTENT
            );
        }

        this.modulePath = function(name) {
            return this.contextRoot + (name ? ('\\' + name) : '');
        }

        this.libraryPath = function(name) {
            return this.modulePath(this.properties.libraryName) + (name ? ('\\' + name) : '');
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
        this.log('Welcome to the ' + chalk.red('TBLegacy Table') + ' generator!');
        this.log('You are about to add a table to the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        const prompts = [ {
            name: 'tableName',
            message: 'What is your table name ?',
            default: this.options.tableName,
            validate: (input, answers) => { return check.validNewFSName("Table", this.contextRoot + "\\DatabaseScript\\Create\\All", input, ".sql" ); }
        },{
            type: 'confirm',
            name: 'codeless',
            message: 'Is it a codeless table?',
            default: false
        },{
            name: 'libraryName',
            message: 'Which is the hosting library ?',
            default: this.options.moduleName + 'Dbl',
            validate: (input, answers) => { return check.validExistingFSName("Library", this.contextRoot, input); },
            when: (answers) => { return !answers.codeless; }
        },{
            type: 'list',
            name: 'tableType',
            message: 'Which kind of table you want:',
            choices: (answers) => { return answers.codeless ? [MASTER, MASTER_DETAIL, SLAVE] : [MASTER, MASTER_DETAIL]; },
            default: MASTER
        },{
            name: 'masterTableNamespace',
            message: 'What is the master table namespace?',
            validate: (input, answers) => { return check.validExistingTableNamespace(this.options.appRoot, input); },
            when: (answers) => { return answers.tableType == SLAVE; }
        },{
            type: 'confirm',
            name: 'defaultFields',
            message: 'Scaffold some default fields (Y) or start with no fields (n)?',
            default: true
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;
            this.properties.appName = this.options.appName;
            this.properties.moduleName = this.options.moduleName;
    
            this.properties.tableBaseName = (this.properties.tableName[2] == '_') ? 
                                            this.properties.tableName.substring(3) : 
                                            this.properties.tableName;

            if (this.properties.tableType === SLAVE) {
                this.properties.masterTableName     =   this.properties.masterTableNamespace.split(".")[3];
                this.properties.masterTableBaseName =   (this.properties.masterTableName[2] == '_') ? 
                                                        this.properties.masterTableName.substring(3) : 
                                                        this.properties.masterTableName;
            }

            this.properties.tableClassName = 'T' + this.properties.tableBaseName;

            if (this.properties.codeless) {
                this.properties.libraryName = 'codeless'; 
                this.properties.dynamicTable = 'dynamic="true"';
            } else {
                this.properties.dynamicTable = '';
            }
            this.properties.tableNamespace = this.properties.appName + '.' + this.properties.moduleName + '.' + this.properties.libraryName + '.' + this.properties.tableName;
        });
    }    

    writing() {
        if (this.properties.tableType === MASTER) {
            var template = '_master';
        } else if (this.properties.tableType === MASTER_DETAIL) {
            var template = '_master_detail';
        } else {
            var template = '_slave';
        }
        // SQL scripts
        this.fs.copyTpl(
            this.templatePath(template + '\\_table.sql'),
            this.modulePath('DatabaseScript\\Create\\All\\' + this.properties.tableName + '.sql'),
            this.properties
        );
        if (this.properties.tableType === MASTER_DETAIL) {
            this.fs.copyTpl(
                this.templatePath(template + '\\_tableDetails.sql'),
                this.modulePath('DatabaseScript\\Create\\All\\' + this.properties.tableName + 'Details.sql'),
                this.properties
            );
        }
        this.fs.copy(
            this.modulePath('DatabaseScript\\Create\\CreateInfo.xml'),
            this.modulePath('DatabaseScript\\Create\\CreateInfo.xml'),
            { process: (contents) => { return this.addToCreateInfo(contents); } }
        );

        if (!this.properties.codeless) {
            // Source code
            this.fs.copyTpl(
                this.templatePath(template + '\\_table.h'),
                this.libraryPath(this.properties.tableClassName + '.h'),
                this.properties
            );
            this.fs.copyTpl(
                this.templatePath(template + '\\_table.cpp'),
                this.libraryPath(this.properties.tableClassName + '.cpp'),
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
                { process: (contents) => { return this.addToProj(contents); } }
            );
        }

        //module objects
        this.fs.copy(
            this.modulePath('ModuleObjects\\DatabaseObjects.xml'),
            this.modulePath('ModuleObjects\\DatabaseObjects.xml'),
            { process: (contents) => { return this.addToDatabaseObjects(template, contents); } }
        );

        //EFCore
        this.fs.copy(
            this.modulePath('EFCore\\EFSchemaObjects.xml'),
            this.modulePath('EFCore\\EFSchemaObjects.xml'),
            { process: (contents) => { return this.addToEFSchemaObjects(template, contents); } }
        );
    }    
}