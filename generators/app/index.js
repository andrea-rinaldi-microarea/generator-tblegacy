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
            name: 'standalone',
            message: 'Is your application standalone?',
            default: false
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
            name: 'defaultLibrary',
            message: 'Name of the first library',
            default: (answers) => { return answers.defaultModule + 'Lib'; },
            validate: (input, answers) => { return check.validNewFSName("Library", this.destinationRoot(), input); }
        }, {
            name: 'activationChars',
            message: 'Your 4-chars activation seed',
            validate: (input, answers) => { return check.valid4CharsCode(input); },
            filter: (input) => { return _.toUpper(input); },
            store: true
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;

            this.checkAppName(this.properties.appName);
        });
    }

    default() {
        this.composeWith(
            require.resolve('../library'), {
                appName: this.properties.appName,
                moduleName: this.properties.defaultModule,
                libraryName: this.properties.defaultLibrary,
                appFolder: this.applicationPath(),
                standalone: this.properties.standalone,
                asSubgenerator: true
            });
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

        // Solution and module (activation)
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
        this.fs.copyTpl(
            this.templatePath('Solutions\\Modules\\_module.xml'),
            this.applicationPath('Solutions\\Modules\\' + this.properties.defaultModule + '.xml'),
            this.properties
        );

        // Default module
        this.fs.copyTpl(
            this.templatePath('_module\\Module.config'),
            this.applicationPath(this.properties.defaultModule + '\\Module.config'),
            this.properties
        );

        // Default module -- database script
        this.fs.copyTpl(
            this.templatePath('_module\\DatabaseScript\\Create\\CreateInfo.xml'),
            this.applicationPath(this.properties.defaultModule + '\\DatabaseScript\\Create\\CreateInfo.xml'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath('_module\\DatabaseScript\\Upgrade\\UpgradeInfo.xml'),
            this.applicationPath(this.properties.defaultModule + '\\DatabaseScript\\Upgrade\\UpgradeInfo.xml'),
            this.properties
        );

        // Default module -- menu and files (images)
        this.fs.copyTpl(
            this.templatePath('_module\\Menu\\_module.menu'),
            this.applicationPath(this.properties.defaultModule + '\\Menu\\' + this.properties.defaultModule + '.menu'),
            this.properties
        );
        this.fs.copy(
            this.templatePath('_module\\Files\\Images\\'),
            this.applicationPath(this.properties.defaultModule + '\\Files\\Images\\')
        );
        this.fs.move(
            this.applicationPath(this.properties.defaultModule + '\\Files\\Images\\_module.png'),
            this.applicationPath(this.properties.defaultModule + '\\Files\\Images\\' + this.properties.defaultModule + '.png')
        );

        // Default module -- ModuleObjects files
        this.fs.copyTpl(
            this.templatePath('_module\\ModuleObjects\\'),
            this.applicationPath(this.properties.defaultModule + '\\ModuleObjects\\'),
            this.properties
        );
    }

    end() {}
};