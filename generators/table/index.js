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

        this.argument('tableName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.addToCreateInfo = function(contents) {
            var lastStep = contents.toString().split('</Level1>')[0].lastIndexOf('numstep="');
            var numStep = (lastStep != -1) ? contents.toString().split('</Level1>')[0].substring(lastStep).split('"')[1] : "0";
            this.properties['numStep'] = _.parseInt(numStep) + 1;

            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: '<Step numstep="'+ this.properties.numStep +'" script="' + this.properties.tableName + '.sql" />\n',
                    justBefore: '</Level1>'
                }]
            );
        }
    
        this.addToInterface = function(contents) {
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: '#include "' + this.properties.tableClassName +'.h"',
                    justBefore: '\n#ifdef _DEBUG'
                },{
                    textToInsert: 'REGISTER_TABLE		(' + this.properties.tableClassName + ')\n',
                    justBefore: 'END_REGISTER_TABLES'
                }]
            );
        }

        this.addToProj = function(contents) {
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: '<ClCompile Include="' + this.properties.tableClassName + '.cpp" />\n',
                    justBefore: '<ClCompile Include='
                },{
                    textToInsert: '<ClInclude Include="' + this.properties.tableClassName + '.h" />\n',
                    justBefore: '<ClInclude Include='
                }]
            );
        }

        this.addToDatabaseObjects = function(contents) {
            var namespace = this.properties.appName + '.' + this.properties.moduleName + '.' + this.properties.library + '.' + this.properties.tableName;
            return utils.insertInSource(
                contents.toString(), [{
                    textToInsert: '<Table namespace="' + namespace + '" mastertable="true">\n' +
                                  '<Create release="1" createstep="' + this.properties.numStep + '" />\n' +
                                  '</Table>\n', 
                    justBefore: '</Tables>'
                }]
            );
        }

        this.modulePath = function(name) {
            return this.contextRoot + (name ? ('\\' + name) : '');
        }

    }

    initializing() {
        var appRoot = path.dirname(path.dirname(this.contextRoot));
        if (!_.toLower(appRoot).endsWith('\\standard\\applications')) {
            this.env.error("Current folder must be a module of a TaskBuilder Application  (<your instance>\\Standard\\Applications\\<your app>\\<your module>).");
        }
        this.options.moduleName = path.basename(this.contextRoot);
        this.options.appName = path.basename(path.dirname(this.contextRoot));

        // var currFolder = this.contextRoot;
        // var folders = _.split(currFolder,'\\');
        // if (folders.length < 3) {
        //     this.env.error("Current folder must be a module of a TaskBuilder Application  (<your instance>\\Standard\\Applications\\<your app>\\<your module>).");
        // }
        // var appPath = currFolder.substring(0, currFolder.length - folders[folders.length - 1].length - folders[folders.length - 2].length - 2);
        // this.destinationRoot(this.contextRoot);
        // this.options['appName'] = folders[folders.length - 2];
        // this.options['moduleName'] = folders[folders.length - 1];
    }

    prompting() {
        this.log('Welcome to the ' + chalk.red('TBLegacy Table') + ' generator!');
        this.log('You are about to add a table to the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        const prompts = [ {
            name: 'tableName',
            message: 'What is your table name ?',
            default: this.options.tableName,
            validate: (input, answers) => { return check.validNewFSName("Table", this.contextRoot + "\\DatabaseScript\\Create\\All", input, ".sql" ); }
        },{
            name: 'library',
            message: 'Which is the hosting library ?',
            default: this.options.moduleName + 'Dbl',
            validate: (input, answers) => { return check.validExistingFSName("Library", this.contextRoot, input); }
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;
            this.properties.appName = this.options.appName;
            this.properties.moduleName = this.options.moduleName;
    
            this.properties.tableBaseName = (this.properties.tableName[2] == '_') ? 
                                            this.properties.tableName.substring(3) : 
                                            this.properties.tableName;

            this.properties.tableClassName = 'T' + this.properties.tableBaseName;
        });
    }    

    writing() {
        // SQL scripts
        this.fs.copyTpl(
            this.templatePath('_table.sql'),
            this.modulePath('DatabaseScript\\Create\\All\\' + this.properties.tableName + '.sql'),
            this.properties
        );
        this.fs.copy(
            this.modulePath('DatabaseScript\\Create\\CreateInfo.xml'),
            this.modulePath('DatabaseScript\\Create\\CreateInfo.xml'),
            { process: (contents) => { return this.addToCreateInfo(contents); } }
        );

        // Source code
        this.fs.copyTpl(
            this.templatePath('_table.h'),
            this.modulePath(this.properties.library + '\\' + this.properties.tableClassName + '.h'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath('_table.cpp'),
            this.modulePath(this.properties.library + '\\' + this.properties.tableClassName + '.cpp'),
            this.properties
        );
        this.fs.copy(
            this.modulePath(this.properties.library + '\\' + this.properties.library + 'Interface.cpp'),
            this.modulePath(this.properties.library + '\\' + this.properties.library + 'Interface.cpp'),
            { process: (contents) => { return this.addToInterface(contents); } }
        );
        this.fs.copy(
            this.modulePath(this.properties.library + '\\' + this.properties.library + '.vcxproj'),
            this.modulePath(this.properties.library + '\\' + this.properties.library + '.vcxproj'),
            { process: (contents) => { return this.addToProj(contents); } }
        );

        //module objects
        this.fs.copy(
            this.modulePath('ModuleObjects\\DatabaseObjects.xml'),
            this.modulePath('ModuleObjects\\DatabaseObjects.xml'),
            { process: (contents) => { return this.addToDatabaseObjects(contents); } }
        );

    }    
}