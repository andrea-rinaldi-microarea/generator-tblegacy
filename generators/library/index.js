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

        this.modulePath = function(name) {
            return this.contextRoot + this.options.moduleSubfolder + (name ? ('\\' + name) : '');
        }

    }

    initializing() {
        if (!this.options.asSubgenerator) {
            var appRoot = path.dirname(path.dirname(this.contextRoot));
            if (!_.toLower(appRoot).endsWith('\\standard\\applications')) {
                this.env.error("Current folder must be a module of a TaskBuilder Application  (<your instance>\\Standard\\Applications\\<your app>\\<your module>).");
            }

            this.options.moduleName = path.basename(this.contextRoot);
            this.options.appName = path.basename(path.dirname(this.contextRoot));
            this.options.moduleSubfolder = '';
            this.options.appPath = appRoot + '\\' + this.options.appName;
        } else {
            this.options.moduleSubfolder =  '\\' + this.options.appName + '\\' + this.options.moduleName;
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
            validate: (input, answers) => { return check.validNewFSName("Library", this.modulePath(), input); }
        }, {
            type: 'confirm',
            name: 'standalone',
            message: 'Is your application standalone?',
            default: false
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;
            this.properties['appName'] = this.options.appName;
            this.properties['moduleName'] = this.options.moduleName;
            this.properties['projectGUID'] = uuid();
            this.properties.moduleSubfolder = this.options.moduleSubfolder;
            this.properties.appPath = this.options.appPath;
        });
    }

    writing() {
        this.fs.copyTpl(
            this.templatePath('_lib\\'),
            this.modulePath(this.properties.libraryName),
            this.properties
        );
        if (this.properties.standalone) {
            var stdafxFile = '_stdafx-NoERP.h';
            var noStdafxfile = '_stdafx-ERP.h';
        } else {
            var stdafxFile = '_stdafx-ERP.h';
            var noStdafxfile = '_stdafx-NoERP.h';
        }
        this.fs.move(
            this.modulePath(this.properties.libraryName + '\\' + stdafxFile),
            this.modulePath(this.properties.libraryName + '\\' + 'stdafx.h')
        );
        this.fs.delete(this.modulePath(this.properties.libraryName + '\\' + noStdafxfile));
        this.fs.move(
            this.modulePath(this.properties.libraryName + '\\' + '_lib.vcxproj'),
            this.modulePath(this.properties.libraryName + '\\' + this.properties.libraryName + '.vcxproj')
        );
        this.fs.move(
            this.modulePath(this.properties.libraryName + '\\' + '_lib.cpp'),
            this.modulePath(this.properties.libraryName + '\\' + this.properties.libraryName + '.cpp')
        );
        this.fs.move(
            this.modulePath(this.properties.libraryName + '\\' + '_interface.cpp'),
            this.modulePath(this.properties.libraryName + '\\' + this.properties.libraryName + 'Interface.cpp')
        );

        this.fs.copy(
            this.properties.appPath + '\\' + this.properties.appName + '.sln',
            this.properties.appPath + '\\' + this.properties.appName + '.sln',
            { process: (contents) => { return this.addToSolution(contents); } }
        );
        
    }

}

