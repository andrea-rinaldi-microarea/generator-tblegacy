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

        this.argument('tablePhisicalName', { type: String, required: false });
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
                if (this.properties.isPK) {
                    actions.push({
                        textToInsert: snippet.render(path.join(this.snippetPath(), this.properties.fieldType, 'efSchemaObjects_PK.xml'), this.properties), 
                        after: '<Table namespace="' + this.properties.tableNamespace + '"',
                        justBefore: '</Segments>',
                        separator: {
                            ifMatch: /[a-z0-9_]/i,
                            skipTrailingBlanks: true,
                            separateWith: ","
                        }
                    });              
                }
                if (this.properties.isFK) {
                    actions.push({
                        textToInsert: snippet.render(path.join(this.snippetPath(), this.properties.fieldType, 'efSchemaObjects_FK.xml'), this.properties), 
                        after: '<Table namespace="' + this.properties.tableNamespace + '"',
                        justBefore: '</ForeignKey>'
                    });              
                }
            } catch(err) {
                console.log(err);
            }
            return utils.insertInSource(
                contents.toString(), 
                actions,
                utils.XML_CONTENT
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
                actions,
                utils.XML_CONTENT
            );
        }

        this.addToCreateSQLScript = function(contents) {
            var actions = [{
                textToInsert: snippet.render(path.join(this.snippetPath(), this.properties.fieldType, 'createSQLScript.sql'), this.properties), 
                justBefore: 'CONSTRAINT [PK_'
            }];
            if (this.properties.isPK) {
                actions.push({
                    textToInsert: snippet.render(path.join(this.snippetPath(), this.properties.fieldType, 'createSQLScript_PK.sql'), this.properties), 
                    after: `CONSTRAINT [PK_${this.properties.tableBaseName}]`,
                    justBefore: ') ON [PRIMARY]'
                });
            }
            if (this.properties.isFK) {
                actions.push({
                    textToInsert: snippet.render(path.join(this.snippetPath(), this.properties.fieldType, 'createSQLScript_FK.sql'), this.properties), 
                    after: `CONSTRAINT [FK_${this.properties.tableBaseName}`,
                    justBefore: ') REFERENCES'
                },{
                    textToInsert: snippet.render(path.join(this.snippetPath(), this.properties.fieldType, 'createSQLScript_FK.sql'), this.properties), 
                    after: 'REFERENCES [dbo]',
                    justBefore: ')'
                });
            }
            return utils.insertInSource(
                contents.toString(), 
                actions,
                utils.SQL_CONTENT
            );
        }

        this.addToUpgradeSQLScript = function(contents) {
            var actions = [{
                textToInsert: snippet.render(this.templatePath(this.properties.fieldType + '\\_alter.sql'), this.properties), 
                justBefore: null // append
            }];
            return utils.insertInSource(
                contents.toString(), 
                actions,
                utils.SQL_CONTENT
            );
        }

        this.addToUpgradeInfo = function(contents) {
            var actions = [{
                textToInsert: snippet.render(path.join(this.snippetPath(), 'upgradeInfo.xml'), this.properties), 
                justBefore: '</UpgradeInfo>'
            }];
            return utils.insertInSource(
                contents.toString(), 
                actions,
                utils.XML_CONTENT
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

        if  (
                this.options.tablePhisicalName &&
                check.validExistingFSName("Table", this.contextRoot + "\\DatabaseScript\\Create\\All" , this.options.tablePhisicalName, ".sql") != true
            ) {
            this.env.error(`The table ${this.options.tablePhisicalName} does not exist.`);
        }
        this.options.appRoot = appRoot;
        this.options.moduleName = path.basename(this.contextRoot);
        this.options.appName = path.basename(path.dirname(this.contextRoot));
    }

    prompting() {
        this.log('Welcome to the ' + chalk.red('TBLegacy database field') + ' generator!');
        this.log('You are about to add a field in a table of the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        this.log(chalk.yellow('WARNING: only codeless tables are supported'));
        if (this.options.tablePhisicalName)
            this.log('Table ' + chalk.bold(this.options.tablePhisicalName));
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
            choices: ['string', 'long', 'date', 'enum', 'bool'],
            default: 'string'
        },{
            type: 'number',
            name: 'fieldLen',
            message: 'Field lenght:',
            default: 10,
            when: (answers) => { return answers.fieldType === 'string'; }
        },{
            type: 'string',
            name: 'enumName',
            message: 'Enum name:',
            when: (answers) => { return answers.fieldType === 'enum'; },
            validate: (input, answers) => { 
                var attributes = check.enumAttributes(this.options.appRoot, this.options.appName, input);
                if (!attributes)
                    return `Enum ${input} does not exist`;
                answers.defaultValue = attributes.value << 16 + attributes.defaultValue;
                return true;
            }
        },{
            type: 'confirm',
            name: 'isPK',
            message: 'Is it part of the primary key?',
            default: false,
            when: (answers) => { return answers.fieldType === 'string' || answers.fieldType === 'long'; },
        },{
            type: 'confirm',
            name: 'isFK',
            message: 'Is it part of the foreign key?',
            default: false,
            when: (answers) => { return answers.isPK; },
        },{
            type: 'confirm',
            name: 'doUpgradeStep',
            message: 'Require an upgrade step (Y) or append to the last one (n)?',
            default: true
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;
            this.properties.appName = this.options.appName;
            this.properties.moduleName = this.options.moduleName;
            this.properties.libraryName = 'codeless'; 
            this.properties.dbRel = parseInt(this.extractDBRel(), 10) + (this.properties.doUpgradeStep ? 1 : 0);
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
        if (this.properties.doUpgradeStep)
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
        if (this.properties.doUpgradeStep)
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
        if (this.properties.doUpgradeStep) {
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
        } else {
            var upgradeSqlScript = this.modulePath('DatabaseScript\\Upgrade\\All\\Release_' + this.properties.dbRel + '\\Alter_' + this.properties.tablePhisicalName + '.sql');
            if (check.validExistingFSName(upgradeSqlScript) == true) {
                this.fs.copy(
                    upgradeSqlScript,
                    upgradeSqlScript,
                    { process: (contents) => { return this.addToUpgradeSQLScript(contents); } }
                );
            } else {
                this.log(chalk.yellow('    No upgrade SQL script found, consider as it is a new table'));                
            }
        }
    }

}