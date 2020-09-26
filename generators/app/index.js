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
const chalk = require('chalk');
const _ = require('lodash');
const nodeFs = require('fs');
const uuid = require('uuid/v1');
const check = require('../check-utils');

var optionOrPrompt = require('yeoman-option-or-prompt');

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('appName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.checkAppName = function(appName) {
            if (!appName) return;

            var result = check.validNewFSName("Application", this.destinationRoot(),  appName);
            if (result != true) {
                this.env.error(result);
            }
        }

        this.applicationPath = function(name) {
            return this.contextRoot + '\\' + this.properties.appName + (name ? ('\\' + name) : '');
        }
    }

    initializing() {
        if (typeof this.options.sourceRoot !== "undefined" && this.options.sourceRoot !== "")
            this.sourceRoot(this.options.sourceRoot);

        if (!_.toLower(this.contextRoot).endsWith('\\standard\\applications')) {
            this.env.error("Current folder must be the standard TaskBuilder Application folder (<your instance>\\Standard\\Applications).");
        }

        this.checkAppName(this.options.appName);
    }

    prompting() {
        this.log('Welcome to the ' + chalk.red('TBLegacy') + ' generator!');
        const prompts = [{
            name: 'organization',
            message: 'What is the name of your organization?',
            validate: (input, answers) => { return check.noEmpty(input); },
            store: true
        }, {
            name: 'appName',
            message: 'What is your app\'s name ?',
            default: this.options.appName,
            validate: (input, answers) => { return check.validNewFSName("Application", this.contextRoot,  input); }
        }, {
            name: 'appDescription',
            message: 'Give your app a description',
            default: (answers) => { return (answers.appName ? answers.appName : this.options.appName) + ' TB Application'; }
        }, {
            name: 'initialVersion',
            message: 'Application version',
            default: '1.0.0.0'
        }, {
            type: 'confirm',
            name: 'codeless',
            message: 'Is it a codeless application?',
            default: false
        }, {
            type: 'confirm',
            name: 'useErpPch',
            message: 'Re-use ERP precompiled headers?',
            default: true,
            when: (answers) => { return !answers.codeless; }
        }, {
            name: 'defaultModule',
            message: 'Name of the first module',
            default: 'main',
            validate: (input, answers) => { return check.validNewFSName("Module", this.destinationRoot(),  input); }
        }, {
            name: 'defaultModuleDescription',
            message: 'Description of the module',
            default: (answers) => { return answers.defaultModule + ' module'; }
        }, {
            name: 'shortName',
            message: 'Module 4-chars short name',
            validate: (input, answers) => { return check.valid4CharsCode(input); },
            filter: (input) => { return _.toUpper(input); },
            store: true
        }, {
            name: 'defaultLibrary',
            message: 'Name of the first library',
            default: (answers) => { return answers.defaultModule + 'Lib'; },
            validate: (input, answers) => { return check.validNewFSName("Library", this.destinationRoot(), input); },
            when: (answers) => { return !answers.codeless; }
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;

            this.checkAppName(this.properties.appName);
        });
    }

    default() {
        this.composeWith(
            require.resolve('../module'), {
                appName: this.properties.appName,
                appFolder: this.applicationPath(),
                organization: this.properties.organization,
                appDescription: this.properties.appDescription,
                moduleName: this.properties.defaultModule,
                moduleDescription: this.properties.defaultModuleDescription,
                shortName: this.properties.shortName,
                asSubgenerator: true
            });
        if (!this.properties.codeless) {
            this.composeWith(
                require.resolve('../library'), {
                    appName: this.properties.appName,
                    moduleName: this.properties.defaultModule,
                    libraryName: this.properties.defaultLibrary,
                    appFolder: this.applicationPath(),
                    useErpPch: this.properties.useErpPch,
                    asSubgenerator: true
                });
        }
    }

    writing() {
        // App config
        this.fs.copyTpl(
            this.templatePath('Application.config'),
            this.applicationPath('Application.config'),
            this.properties
        );

        // VS Solution
        this.fs.copyTpl(
            this.templatePath('_app.sln'),
            this.applicationPath(this.properties.appName + '.sln'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath('_app.props'),
            this.applicationPath(this.properties.appName + '.props'),
            this.properties
        );

        // License Solution
        this.fs.copyTpl(
            this.templatePath('Solutions\\_solution.xml'),
            this.applicationPath('Solutions\\' + this.properties.appName + '.Solution.xml'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath('Solutions\\_solution.Brand.xml'),
            this.applicationPath('Solutions\\' + this.properties.appName + '.Solution.Brand.xml'),
            this.properties
        );
    }

    end() {}
};