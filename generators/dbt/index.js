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
const path = require('path');
const utils = require('../text-utils');
const snippet = require('../snippet-utils');
const check = require('../check-utils');
const xmlPretty = require('prettify-xml');

const SLAVE = 'Slave'
const SLAVE_BUFFERED = 'SlaveBuffered'

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('dbtName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.modulePath = function(name) {
            return this.contextRoot + (name ? ('\\' + name) : '');
        }

        this.snippetPath = function() {
            return path.normalize(path.join(this.sourceRoot(), '../snippets'));
        }

        this.addDbts = function(contents) {
            var masterDBTNS = utils.extractInfo(this.modulePath(`ModuleObjects\\${this.properties.docName}\\Description\\Dbts.xml`), '<Master namespace="', '">');
            var masterTableNS = utils.extractInfo(this.modulePath(`ModuleObjects\\${this.properties.docName}\\Description\\Dbts.xml`), '<Table namespace="', '">');

            this.properties.dbtNamespace = masterDBTNS.slice(0, -1 * (masterDBTNS.split(".")[3].length)) + this.properties.dbtName;
            this.properties.masterTableName = masterTableNS.split(".")[3];
            this.properties.masterTableNamespace = masterTableNS;
            var actions = [{
                textToInsert: snippet.render(path.join(this.snippetPath(), 'dbt.xml'), this.properties), 
                justBefore: '</Slaves>'
            }];
            return utils.insertInSource(
                contents.toString(), 
                actions,
                utils.XML_CONTENT
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
        this.log('Welcome to the ' + chalk.red('TBLegacy DBT') + ' generator!');
        this.log('You are about to add a document part (DBT) definition to the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        this.log(chalk.yellow('WARNING: only codeless applications are supported'));
        const prompts = [ {
            name: 'docName',
            message: 'Which is the name of the containing document ?',
            validate: (input, answers) =>
            { 
                if (check.validExistingFSName("Document", `${this.modulePath()}\\ModuleObjects\\${input}\\Description`,'\\Document.xml') == true) {
                    return true;
                };
                return `Document ${input} does not exists`;
            }
        },{
            name: 'dbtName',
            message: 'What is the name of the new DBT?',
            validate: (input, answers) => { return check.validIdentifierName("DBT", input); }
        },{
            name: 'description',
            message: 'Enter a description for the DBT:',
            default: (answers) => { return (this.options.dbtName || answers.dbtName) + ' DBT' }
        },{
            name: 'dbtTableNamespace',
            message: 'What is the DBT table namespace?',
            validate: (input, answers) => { return check.validExistingTableNamespace(this.options.appRoot, input); }
        },{
            type: 'list',
            name: 'dbtType',
            message: 'Which kind of DBT you want:',
            choices: (answers) => { return [SLAVE_BUFFERED, SLAVE ]; },
            default: SLAVE_BUFFERED
        },{
            type: 'confirm',
            name: 'defineFK',
            message: 'Define FK in Dbts.xml for the new DBT?',
            default: false
        },{
            name: 'fkName',
            message: 'Enter the name of the FK field:',
            validate: (input, answers) => { return check.validIdentifierName("Field", input); },
            when: (answers) => { return answers.defineFK; }
        }];
        return this.optionOrPrompt(prompts).then(properties => {
                this.properties = properties;
                this.properties.appName = this.options.appName;
                this.properties.moduleName = this.options.moduleName;

                this.properties.dbtTableName =  this.properties.dbtTableNamespace.split(".")[3];
            });
        }    

    writing() {
        // Module Objects
        var dbts = `ModuleObjects\\${this.properties.docName}\\Description\\Dbts.xml`;
        this.fs.copy(
            this.modulePath(dbts),
            this.modulePath(dbts),
            { process: (contents) => { return this.addDbts(contents); } }
        );
    }
}