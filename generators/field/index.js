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

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('fieldName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.modulePath = function(name) {
            return this.contextRoot + (name ? ('\\' + name) : '');
        }

        this.snippetPath = function() {
            return path.normalize(path.join(this.sourceRoot(), '../snippets'));
        }

        this.addToDatabaseObjects = function(template, contents) {
            try {
                var actions = [{
                    textToInsert: snippet.render(path.join(this.snippetPath(), this.properties.fieldType, template), this.properties), 
                    after: '<Table namespace="' + this.properties.tableNamespace + '"',
                    justBefore: '</Columns>'
                }];
            } catch(err) {
                console.log(err);
            }
            return utils.insertInSource(
                contents.toString(), 
                actions
            );
        }

        this.UpdateDBRel = function(contents) {
            var actions = [{
                matchStart: '<Release>', 
                matchEnd: '</Release>', 
                newContent: this.properties.dbRel
            },{
                matchStart: '<Release development="true">', 
                matchEnd: '</Release>', 
                newContent: this.properties.dbRel
            }];
            return utils.replaceInSource(
                contents.toString(), 
                actions
            );
        }

        this.addToCreateSQLScript = function(contents) {
            var actions = [{
                textToInsert: snippet.render(path.join(this.snippetPath(), this.properties.fieldType, 'createSQLScript.sql'), this.properties), 
                justBefore: 'CONSTRAINT [PK_'
            }];
            return utils.insertInSource(
                contents.toString(), 
                actions
            );
        }

        this.addToUpgradeInfo = function(contents) {
            var actions = [{
                textToInsert: snippet.render(path.join(this.snippetPath(), 'upgradeInfo.xml'), this.properties), 
                justBefore: '</UpgradeInfo>'
            }];
            return utils.insertInSource(
                contents.toString(), 
                actions
            );
        }

        this.extractDBRel = function() {
            var res = utils.extractInfo(this.modulePath('ModuleObjects\\DatabaseObjects.xml'), '<Release>', '</Release>');
            if (res === false) {
                res = utils.extractInfo(this.modulePath('ModuleObjects\\DatabaseObjects.xml'), '<Release development="true">', '</Release>');
            }
            if (res === false) {
                return 0;
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
        this.options.appRoot = appRoot;
        this.options.moduleName = path.basename(this.contextRoot);
        this.options.appName = path.basename(path.dirname(this.contextRoot));
    }

    prompting() {
        this.log('Welcome to the ' + chalk.red('TBLegacy database field') + ' generator!');
        this.log('You are about to add a field in a table of the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        this.log(chalk.yellow('WARNING: only codeless tables are supported'));
        const prompts = [ {
            name: 'tablePhisicalName',
            message: 'What is the table phisical name in which add the field?',
            validate: (input, answers) => { return check.validExistingFSName("Table", this.contextRoot + "\\DatabaseScript\\Create\\All" , input, ".sql"); }
        },{
            name: 'fieldName',
            message: 'What is the field name ?',
            default: this.options.fieldName,
            validate: (input, answers) => { return check.validIdentifierName("Field", input); }
        },{
            name: 'fieldDescri',
            message: 'Enter a description for the field',
            default: (answers) => { return (this.options.fieldName || answers.fieldName) + ' field' }
        },{
            type: 'list',
            name: 'fieldType',
            message: 'Choose the field type:',
            choices: ['string', 'Long', 'date'],
            default: 'string'
        },{
            type: 'number',
            name: 'fieldLen',
            message: 'Field lenght:',
            default: 10,
            when: (answers) => { return answers.fieldType === 'string'; }
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;
            this.properties.appName = this.options.appName;
            this.properties.moduleName = this.options.moduleName;
            this.properties.libraryName = 'codeless'; 
            this.properties.dbRel = parseInt(this.extractDBRel(), 10) + 1;
            this.properties.tableNamespace = this.properties.appName + '.' + this.properties.moduleName + '.' + this.properties.libraryName + '.' + this.properties.tablePhisicalName;
            this.properties.tableBaseName = (this.properties.tablePhisicalName[2] == '_') ? 
                                            this.properties.tablePhisicalName.substring(3) : 
                                            this.properties.tablePhisicalName;
        });
    }    

    writing() {
        //DatabaseObjects
        this.fs.copy(
            this.modulePath('ModuleObjects\\DatabaseObjects.xml'),
            this.modulePath('ModuleObjects\\DatabaseObjects.xml'),
            { process: (contents) => { return this.addToDatabaseObjects('databaseObjects.xml', contents); } }
        );
        this.fs.copy(
            this.modulePath('ModuleObjects\\DatabaseObjects.xml'),
            this.modulePath('ModuleObjects\\DatabaseObjects.xml'),
            { process: (contents) => { return this.UpdateDBRel(contents); } }
        );

        //EFCore
        this.fs.copy(
            this.modulePath('EFCore\\EFSchemaObjects.xml'),
            this.modulePath('EFCore\\EFSchemaObjects.xml'),
            { process: (contents) => { return this.addToDatabaseObjects('efSchemaObjects.xml', contents); } }
        );
        this.fs.copy(
            this.modulePath('EFCore\\EFSchemaObjects.xml'),
            this.modulePath('EFCore\\EFSchemaObjects.xml'),
            { process: (contents) => { return this.UpdateDBRel(contents); } }
        );

        //database scripts
        this.fs.copy(
            this.modulePath('DatabaseScript\\Create\\All\\' + this.properties.tablePhisicalName + '.sql'),
            this.modulePath('DatabaseScript\\Create\\All\\' + this.properties.tablePhisicalName + '.sql'),
            { process: (contents) => { return this.addToCreateSQLScript(contents); } }
        );
        this.fs.copyTpl(
            this.templatePath(this.properties.fieldType + '\\_alter.sql'),
            this.modulePath('DatabaseScript\\Upgrade\\All\\Release_' + this.properties.dbRel + '\\Alter_' + this.properties.tablePhisicalName + '.sql'),
            this.properties
        );
        this.fs.copy(
            this.modulePath('DatabaseScript\\Upgrade\\UpgradeInfo.xml'),
            this.modulePath('DatabaseScript\\Upgrade\\UpgradeInfo.xml'),
            { process: (contents) => { return this.addToUpgradeInfo(contents); } }
        );
    }

}