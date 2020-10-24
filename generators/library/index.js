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
const check = require('../check-utils');
const utils = require('../text-utils');
const _ = require('lodash');
const uuid = require('uuid/v1');
const path = require('path');

var optionOrPrompt = require('yeoman-option-or-prompt');

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('libraryName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.addToSolution = function(contents) {
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: 'Project("{' + this.properties.projectGUID + '}") = "' + this.properties.libraryName + '", "' + this.properties.moduleName +'\\' + this.properties.libraryName + '\\' + this.properties.libraryName +'.vcxproj", "{' + this.properties.projectGUID + '}"\n' +
                    'EndProject\n',
                    justBefore: 'Global'
                }]
            );
        }

        this.addToModuleConfig = function(contents) {
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: '<Library name="' + this.properties.libraryName + '" sourcefolder="' + this.properties.libraryName + '" deploymentpolicy="full" />\n',
                    justBefore: '</Components>'
                }],
                utils.XML_CONTENT
            );
        }

        this.appPath = function(name) {
            return this.properties.appFolder + (name ? ('\\' + name) : '');
        }

        this.modulePath = function(name) {
            return this.appPath(this.properties.moduleName) + (name ? ('\\' + name) : '');
        }

        this.libraryPath = function(name) {
            return this.modulePath(this.properties.libraryName) + (name ? ('\\' + name) : '');
        }
    }

    initializing() {
        if (typeof this.options.sourceRoot !== "undefined" && this.options.sourceRoot !== "")
            this.sourceRoot(this.options.sourceRoot);

        if (!this.options.asSubgenerator) {
            var appRoot = path.dirname(path.dirname(this.contextRoot));
            if (!_.toLower(appRoot).endsWith('\\standard\\applications')) {
                this.env.error("Current folder must be a module of a TaskBuilder Application  (<your instance>\\Standard\\Applications\\<your app>\\<your module>).");
            }

            this.options.moduleName = path.basename(this.contextRoot);
            this.options.appName = path.basename(path.dirname(this.contextRoot));
            this.options.appFolder = appRoot + '\\' + this.options.appName;
        }
    }

    prompting() {
        if (!this.options.asSubgenerator) {
            this.log('Welcome to the ' + chalk.red('TBLegacy Library') + ' generator!');
            this.log('You are about to add a library to the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        }
        const prompts = [ {
            name: 'libraryName',
            message: 'What is your library name ?',
            default: this.options.libraryName,
            validate: (input, answers) => { return check.validNewFSName("Library", this.options.appFolder + '\\' + this.options.moduleName, input); }
        }, {
            type: 'confirm',
            name: 'useErpPch',
            message: 'Re-use ERP precompiled headers?',
            default: false
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;
            this.properties.appName = this.options.appName;
            this.properties.moduleName = this.options.moduleName;
            this.properties.appFolder = this.options.appFolder;
            this.properties.projectGUID = uuid();
        });
    }

    writing() {
        this.fs.copyTpl(
            this.templatePath('_lib\\'),
            this.modulePath(this.properties.libraryName),
            this.properties
        );
        if (this.properties.useErpPch) {
            var stdafxFile = '_stdafx-ERP.h';
            var noStdafxfile = '_stdafx-NoERP.h';
        } else {
            var stdafxFile = '_stdafx-NoERP.h';
            var noStdafxfile = '_stdafx-ERP.h';
        }
        this.fs.move(
            this.libraryPath(stdafxFile),
            this.libraryPath('stdafx.h')
        );
        this.fs.delete(this.libraryPath(noStdafxfile));
        this.fs.move(
            this.libraryPath('_lib.vcxproj'),
            this.libraryPath(this.properties.libraryName + '.vcxproj')
        );
        this.fs.move(
            this.libraryPath('_lib.cpp'),
            this.libraryPath(this.properties.libraryName + '.cpp')
        );
        this.fs.move(
            this.libraryPath('_interface.cpp'),
            this.libraryPath(this.properties.libraryName + 'Interface.cpp')
        );

        this.fs.copy(
            this.modulePath('Module.config'),
            this.modulePath('Module.config'),
            { process: (contents) => { return this.addToModuleConfig(contents); } }
        );
        
        this.fs.copy(
            this.appPath(this.properties.appName + '.sln'),
            this.appPath(this.properties.appName + '.sln'),
            { process: (contents) => { return this.addToSolution(contents); } }
        );
        
    }

}

