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

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('enumName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.modulePath = function(name) {
            return this.contextRoot + (name ? ('\\' + name) : '');
        }

        this.snippetPath = function() {
            return path.normalize(path.join(this.sourceRoot(), '../snippets'));
        }

        this.addToEnums = function(contents) {
            try {
                var tagText = snippet.render(path.join(this.snippetPath(), 'tag.xml'), this.properties);
                for (var v = 0; v < this.properties.numValues; v++) {
                    this.properties.currValue = v;
                    this.properties.storedValue = (this.properties.enumBase << 16) + v;
                    var itemActions = [{
                        textToInsert: snippet.render(path.join(this.snippetPath(), 'item.xml'), this.properties), 
                        justBefore: '</Tag>'
                    }];
                    tagText = utils.insertInSource(
                        tagText, 
                        itemActions
                    );                    
                }
                var actions = [{
                    textToInsert: tagText, 
                    justBefore: '</Enums>'
                }];
            } catch(err) {
                console.log(err);
            }
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
        this.log('Welcome to the ' + chalk.red('TBLegacy enum') + ' generator!');
        this.log('You are about to add an enum definition to the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        this.log(chalk.yellow('WARNING: only codeless applications are supported'));
        const prompts = [ {
            name: 'enumName',
            message: 'What is the name of the new enum?',
            validate: (input, answers) => { 
                var attrs = check.enumAttributes(this.options.appRoot, this.options.appName, input);
                if ( attrs != null) {
                    return `Enum ${input} already existing in module ${attrs.module}`;
                } else {
                    return true;
                } 
            }
        },{
            name: 'enumDescri',
            message: 'Enter a description for the enum',
            default: (answers) => { return (this.options.enumName || answers.enumName) + ' enum' }
        },{
            type: 'number',
            name: 'enumBase',
            message: 'Enter the enum base value',
            validate: (input, answers) => { return true; /* TODO check for duplicates */ }
        },{
            type: 'number',
            name: 'numValues',
            message: 'How many values in the enum?',
            default: 3,
            validate: (input, answers) => { return input > 0 && input <= 255; }
        }];
        return this.optionOrPrompt(prompts).then(properties => {
                this.properties = properties;
                this.properties.appName = this.options.appName;
                this.properties.moduleName = this.options.moduleName;
            });
        }    

    writing() {
        this.fs.copy(
            this.modulePath('ModuleObjects\\Enums.xml'),
            this.modulePath('ModuleObjects\\Enums.xml'),
            { process: (contents) => { return this.addToEnums(contents); } }
        );
    }
}