const Generator = require('yeoman-generator');
const chalk = require('chalk');
const check = require('../check-utils');
const utils = require('../text-utils');
const _ = require('lodash');
const uuid = require('uuid/v1');

var optionOrPrompt = require('yeoman-option-or-prompt');

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('libraryName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.addToSolution = function(contents) {
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: 'Project("' + this.properties.projectGUID + '") = "' + this.properties.libraryName + '", "' + this.properties.moduleName +'\\' + this.properties.libraryName + '\\' + this.properties.libraryName +'.vcxproj", "' + this.properties.projectGUID + '"\n' +
                    'EndProject\n',
                    justBefore: 'Global'
                }]
            );
        }

    }

    initializing() {
        var currFolder = this.contextRoot;
        var folders = _.split(currFolder,'\\');
        if (folders.length < 3) {
            this.env.error("Current folder must be a module of a TaskBuilder Application  (<your instance>\\Standard\\Applications\\<your app>\\<your module>).");
        }
        var appPath = currFolder.substring(0, currFolder.length - folders[folders.length - 1].length - folders[folders.length - 2].length - 2);
        if (!_.toLower(appPath).endsWith('\\standard\\applications')) {
            this.env.error("Current folder must be a module of a TaskBuilder Application  (<your instance>\\Standard\\Applications\\<your app>\\<your module>).");
        }
        this.destinationRoot(this.contextRoot);
        this.options['appName'] = folders[folders.length - 2];
        this.options['moduleName'] = folders[folders.length - 1];
    }

    prompting() {
        this.log('Welcome to the ' + chalk.red('TBLegacy Library') + ' generator!');
        this.log('You are about to add a library to the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        const prompts = [ {
            name: 'libraryName',
            message: 'What is your library name ?',
            default: this.options.libraryName,
            validate: (input, answers) => { return check.validNewFSName("Library", this.destinationRoot(), input); }
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

        });
    }

    writing() {
        this.destinationRoot(this.contextRoot);
        this.fs.copyTpl(
            this.templatePath('_lib\\'),
            this.destinationPath(this.properties.libraryName),
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
            this.destinationPath(this.properties.libraryName + '\\' + stdafxFile),
            this.destinationPath(this.properties.libraryName + '\\' + 'stdafx.h')
        );
        this.fs.delete(this.destinationPath(this.properties.libraryName + '\\' + noStdafxfile));
        this.fs.move(
            this.destinationPath(this.properties.libraryName + '\\' + '_lib.vcxproj'),
            this.destinationPath(this.properties.libraryName + '\\' + this.properties.libraryName + '.vcxproj')
        );
        this.fs.move(
            this.destinationPath(this.properties.libraryName + '\\' + '_lib.cpp'),
            this.destinationPath(this.properties.libraryName + '\\' + this.properties.libraryName + '.cpp')
        );
        this.fs.move(
            this.destinationPath(this.properties.libraryName + '\\' + '_interface.cpp'),
            this.destinationPath(this.properties.libraryName + '\\' + this.properties.libraryName + 'Interface.cpp')
        );

        //solution
        this.fs.copy(
            this.destinationPath('..\\' + this.properties.appName + '.sln'),
            this.destinationPath('..\\' + this.properties.appName + '.sln'),
            { process: (contents) => { return this.addToSolution(contents); } }
        );
        
    }

}

