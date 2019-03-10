const Generator = require('yeoman-generator');
const check = require('../check-utils');
const utils = require('../text-utils');
const _ = require('lodash');
const path = require('path');
const chalk = require('chalk');

var optionOrPrompt = require('yeoman-option-or-prompt');

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('moduleName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.appPath = function(name) {
            return this.properties.appFolder + (name ? ('\\' + name) : '');
        }

        this.addSolutionXml = function(contents) {
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: '<SalesModule name="' + this.properties.moduleName + '" />\n',
                    justBefore: '</Product>'
                }]
            );
        }

    }
    
    initializing() {
        if (typeof this.options.sourceRoot !== "undefined" && this.options.sourceRoot !== "")
            this.sourceRoot(this.options.sourceRoot);

        if (!this.options.asSubgenerator) {
            var appRoot = path.dirname(this.contextRoot);
            if (!_.toLower(appRoot).endsWith('\\standard\\applications')) {
                this.env.error("Current folder must be inside a TaskBuilder Application  (<your instance>\\Standard\\Applications\\<your app>).");
            }

            this.options.appName = path.basename(this.contextRoot);
            this.options.appFolder = appRoot + '\\' + this.options.appName;
        }
    }
    prompting() {
        if (!this.options.asSubgenerator) {
            this.log('Welcome to the ' + chalk.red('TBLegacy Module') + ' generator!');
            this.log('You are about to add a module to the ' + chalk.bold(this.options.appName) + ' application.' )
        }
        const prompts = [ {
            name: 'organization',
            message: 'What is the name of your organization?',
            validate: (input, answers) => { return check.noEmpty(input); },
            store: true
        }, {
            name: 'moduleName',
            message: 'What is your module name ?',
            default: this.options.moduleName,
            validate: (input, answers) => { return check.validNewFSName("Module", this.options.appFolder, input); }
        }, {
            name: 'moduleDescription',
            message: 'Description of the module',
            default: (answers) => { return answers.moduleName + ' module'; }
        }, {
            name: 'appDescription',
            message: 'Description of the application',
            default: (answers) => { return this.options.appName + ' TB Application'; }
        }, {
            name: 'activationChars',
            message: 'Your 4-chars activation seed',
            validate: (input, answers) => { return check.valid4CharsCode(input); },
            filter: (input) => { return _.toUpper(input); },
            store: true
        }];
        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;
            this.properties.appName = this.options.appName;
            this.properties.appFolder = this.options.appFolder;
        });
    }

    writing() {
        // solution module
        this.fs.copyTpl(
            this.templatePath('Solutions\\Modules\\_module.xml'),
            this.appPath('Solutions\\Modules\\' + this.properties.moduleName + '.xml'),
            this.properties
        );

        this.fs.copy(
            this.appPath('Solutions\\' + this.properties.appName + '.Solution.xml'),
            this.appPath('Solutions\\' + this.properties.appName + '.Solution.xml'),
            { process: (contents) => { return this.addSolutionXml(contents); } }
        );

        // module config
        this.fs.copyTpl(
            this.templatePath('_module\\Module.config'),
            this.appPath(this.properties.moduleName + '\\Module.config'),
            this.properties
        );

        // database script
        this.fs.copyTpl(
            this.templatePath('_module\\DatabaseScript\\Create\\CreateInfo.xml'),
            this.appPath(this.properties.moduleName + '\\DatabaseScript\\Create\\CreateInfo.xml'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath('_module\\DatabaseScript\\Upgrade\\UpgradeInfo.xml'),
            this.appPath(this.properties.moduleName + '\\DatabaseScript\\Upgrade\\UpgradeInfo.xml'),
            this.properties
        );

        // menu and files (images)
        this.fs.copyTpl(
            this.templatePath('_module\\Menu\\_module.menu'),
            this.appPath(this.properties.moduleName + '\\Menu\\' + this.properties.moduleName + '.menu'),
            this.properties
        );
        this.fs.copy(
            this.templatePath('_module\\Files\\Images\\'),
            this.appPath(this.properties.moduleName + '\\Files\\Images\\')
        );
        this.fs.move(
            this.appPath(this.properties.moduleName + '\\Files\\Images\\_module.png'),
            this.appPath(this.properties.moduleName + '\\Files\\Images\\' + this.properties.moduleName + '.png')
        );

        //  ModuleObjects files
        this.fs.copyTpl(
            this.templatePath('_module\\ModuleObjects\\'),
            this.appPath(this.properties.moduleName + '\\ModuleObjects\\'),
            this.properties
        );

    }
}