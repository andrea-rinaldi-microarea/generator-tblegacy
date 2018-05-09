const Generator = require('yeoman-generator');
var optionOrPrompt = require('yeoman-option-or-prompt');
const chalk = require('chalk');
const _ = require('lodash');
const nodeFs = require('fs');
const utils = require('../text-utils');
const check = require('../check-utils');
const path = require('path');

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('documentName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;
    }

    initializing() {
        var appRoot = path.dirname(path.dirname(this.contextRoot));
        if (!_.toLower(appRoot).endsWith('\\standard\\applications')) {
            this.env.error("Current folder must be a module of a TaskBuilder Application  (<your instance>\\Standard\\Applications\\<your app>\\<your module>).");
        }
        this.options.moduleName = path.basename(this.contextRoot);
        this.options.appName = path.basename(path.dirname(this.contextRoot));
    }

    prompting() {
        this.log('Welcome to the ' + chalk.red('TBLegacy Document') + ' generator!');
        this.log('You are about to add a document to the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        const prompts = [ {
            name: 'documentName',
            message: 'What is your document name ?',
            default: this.options.documentName,
            validate: (input, answers) => { return check.validNewFSName("Document", this.contextRoot + "\\ModuleObjects", input, "\\Description\\Document.xml" ); }
        },{
            name: 'libraryName',
            message: 'Which is the hosting library ?',
            default: this.options.moduleName + 'Documents',
            validate: (input, answers) => { return check.validExistingFSName("Library", this.contextRoot, input); }
        },{
            name: 'dblName',
            message: 'Which library contains the table definition ?',
            default: this.options.moduleName + 'Dbl',
            validate: (input, answers) => { return check.validExistingFSName("Library", this.contextRoot, input); }
        },{
            name: 'tableName',
            message: 'Which is the master table?',
            default: (answers) => { return 'T' + answers.documentName },
            validate: (input, answers) => { return check.validExistingFSName("Table", this.contextRoot+ "\\" + answers.dblName , input, ".h"); }
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;
            this.properties.appName = this.options.appName;
            this.properties.moduleName = this.options.moduleName;
    
        });
    }

    writing() {
    }
}