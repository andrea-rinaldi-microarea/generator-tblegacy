const Generator = require('yeoman-generator');
const chalk = require('chalk');
const _ = require('lodash');
const nodeFs = require('fs');
var optionOrPrompt = require('yeoman-option-or-prompt');

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('appName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.validElemName = function(type, name) {
            if (!name) {
                return "Empty name not allowed";
            }

            if (nodeFs.existsSync(this.destinationRoot() + '\\' + name)) {
                return type + " " + name + " already exists, please choose another name.";
            }

            var fNamePattern = /^[a-z0-9_-\s]+$/gi;
            if (!fNamePattern.test(name)) {
                return "Invalid characters in " + type + " name, must be a valid folder name.";
            }

            if (_.includes(name, ' ')) {
                return type + " name must not contain spaces.";
            }

            return true;
        }

        this.noEmpty = function(element) {
            if (!element) {
                return "Empty value not allowed";
            }

            return true;
        }

        this.valid4CharsCode = function(value) {
            if (!value) {
                return "Empty value not allowed";
            }

            if (value.length != 4) {
                return "You must enter exactly 4 chars";
            }

            var seedPattern = /^[a-z\s]+$/gi;
            if (!seedPattern.test(value)) {
                return "Invalid characters in code (letters only).";
            }

            return true;
        }

        this.checkAppName = function(appName) {
            if (!appName) return;

            var result = this.validElemName("Application", appName);
            if (result != true) {
                this.env.error(result);
            }
        }
    }

    initializing() {
        var currFolder = this.destinationRoot();
        if (!_.toLower(currFolder).endsWith('\\standard\\applications')) {
            this.env.error("Current folder must be the standard TaskBuilder Application folder (<your instance>\\Standard\\Applications).");
        }

        this.checkAppName(this.options.appName);
    }

    prompting() {
        this.log('Welcome to the ' + chalk.red('TBLegacy') + ' generator!');
        const prompts = [{
            name: 'organization',
            message: 'What is the name of your organization?',
            validate: (input, answers) => { return this.noEmpty(input); },
            store: true
        }, {
            name: 'appName',
            message: 'What is your app\'s name ?',
            default: this.options.appName,
            validate: (input, answers) => { return this.validElemName("Application", input); }
        }, {
            name: 'appDescription',
            message: 'Give your app a description',
            default: (answers) => { return answers.appName + ' TB Application'; }
        }, {
            name: 'initialVersion',
            message: 'Application version',
            default: '1.0.0.0'
        }, {
            name: 'dbSignature',
            message: 'Database signature (for TB_DBMark)',
            default: (answers) => { return _.toUpper(answers.appName); }
        }, {
            name: 'defaultModule',
            message: 'Name of the first module',
            default: 'main',
            validate: (input, answers) => { return this.validElemName("Module", input); }
        }, {
            name: 'defaultModuleDescription',
            message: 'Description of the module',
            default: (answers) => { return answers.defaultModule + ' module'; }
        }, {
            name: 'activationChars',
            message: 'Your 4-chars activation seed',
            validate: (input, answers) => { return this.valid4CharsCode(input); },
            filter: (input) => { return _.toUpper(input); }
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;

            this.checkAppName(this.properties.appName);
        });
    }

    writing() {
        var parentPath = this.destinationRoot();
        this.destinationRoot(parentPath + '\\' + this.properties.appName);

        // App config
        this.fs.copyTpl(
            this.templatePath('Application.config'),
            this.destinationPath('Application.config'),
            this.properties
        );

        // Solution and module (activation)
        this.fs.copyTpl(
            this.templatePath('Solutions\\_solution.xml'),
            this.destinationPath('Solutions\\' + this.properties.appName + '.Solution.xml'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath('Solutions\\Modules\\_module.xml'),
            this.destinationPath('Solutions\\Modules\\' + this.properties.defaultModule + '.xml'),
            this.properties
        );

        // Default module
        this.fs.copyTpl(
            this.templatePath('_module\\Module.config'),
            this.destinationPath(this.properties.defaultModule + '\\Module.config'),
            this.properties
        );

        // Default module -- database script
        this.fs.copyTpl(
            this.templatePath('_module\\DatabaseScript\\Create\\CreateInfo.xml'),
            this.destinationPath(this.properties.defaultModule + '\\DatabaseScript\\Create\\CreateInfo.xml'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath('_module\\DatabaseScript\\Upgrade\\UpgradeInfo.xml'),
            this.destinationPath(this.properties.defaultModule + '\\DatabaseScript\\Upgrade\\UpgradeInfo.xml'),
            this.properties
        );

        // Default module -- menu and files (images)
        this.fs.copyTpl(
            this.templatePath('_module\\Menu\\_module.menu'),
            this.destinationPath(this.properties.defaultModule + '\\Menu\\' + this.properties.defaultModule + '.menu'),
            this.properties
        );
        this.fs.copy(
            this.templatePath('_module\\Files\\Images\\_module.png'),
            this.destinationPath(this.properties.defaultModule + '\\Files\\Images\\' + this.properties.defaultModule + '.png'),
            this.properties
        );

        // ModuleObjects files
        this.fs.copyTpl(
            this.templatePath('_module\\ModuleObjects\\'),
            this.destinationPath(this.properties.defaultModule + '\\ModuleObjects\\'),
            this.properties
        );

    }

    end() {}
};