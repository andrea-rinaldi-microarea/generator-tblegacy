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

        this.validAppName = function(appName) {
            if (!appName) {
                return "Empty name not allowed";
            }

            if (nodeFs.existsSync(this.destinationRoot() + '\\' + appName)) {
                return "Application " + appName + " already exists, please choose another name.";
            }

            var fNamePattern = /^[a-z0-9_-\s]+$/gi;
            if (!fNamePattern.test(appName)) {
                return "Invalid characters in application name.";
            }

            if (_.includes(appName, ' ')) {
                return "Application name must not include spaces.";
            }

            return true;
        }

        this.checkAppName = function(appName) {
            if (!appName) return;

            var result = this.validAppName(appName);
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
            name: 'appName',
            message: 'What is your app\'s name ?',
            default: this.options.appName,
            validate: (input, answers) => { return this.validAppName(input); }
        }, {
            name: 'initialVersion',
            message: 'Application version',
            default: '1.0.0.0'
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;

            this.checkAppName(this.properties.appName);
        });
    }

    writing() {}
};