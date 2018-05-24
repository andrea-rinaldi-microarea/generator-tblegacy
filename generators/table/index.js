const Generator = require('yeoman-generator');
var optionOrPrompt = require('yeoman-option-or-prompt');
const chalk = require('chalk');
const _ = require('lodash');
const nodeFs = require('fs');
const utils = require('../text-utils');
const check = require('../check-utils');
const path = require('path');

const MASTER = 'master';
const MASTER_DETAIL = 'master/detail'

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
            var actions = [{
                textToInsert: '#include "' + this.properties.tableClassName +'.h"\n',
                justBefore: '\n#ifdef _DEBUG'
            },{
                textToInsert: 'REGISTER_TABLE		(' + this.properties.tableClassName + ')\n',
                justBefore: 'END_REGISTER_TABLES'
            }];
            if (this.properties.tableType === MASTER_DETAIL) {
                actions = actions.concat(
                    [{
                        textToInsert: 'REGISTER_TABLE		(' + this.properties.tableClassName + 'Details)\n',
                        justBefore: 'END_REGISTER_TABLES'
                    }]
                );
            }
            return utils.insertInSource(
                contents.toString(), 
                actions
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
            var namespace = this.properties.appName + '.' + this.properties.moduleName + '.' + this.properties.libraryName + '.' + this.properties.tableName;
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

        this.libraryPath = function(name) {
            return this.modulePath(this.properties.libraryName) + (name ? ('\\' + name) : '');
        }

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
        this.log('Welcome to the ' + chalk.red('TBLegacy Table') + ' generator!');
        this.log('You are about to add a table to the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        const prompts = [ {
            name: 'tableName',
            message: 'What is your table name ?',
            default: this.options.tableName,
            validate: (input, answers) => { return check.validNewFSName("Table", this.contextRoot + "\\DatabaseScript\\Create\\All", input, ".sql" ); }
        },{
            name: 'libraryName',
            message: 'Which is the hosting library ?',
            default: this.options.moduleName + 'Dbl',
            validate: (input, answers) => { return check.validExistingFSName("Library", this.contextRoot, input); }
        },{
            type: 'list',
            name: 'tableType',
            message: 'Which kind of table you want:',
            choices: [MASTER, MASTER_DETAIL],
            default: MASTER
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
        if (this.properties.tableType === MASTER) {
            var template = '_master';
        } else {
            var template = '_master_detail';
        }
        // SQL scripts
        this.fs.copyTpl(
            this.templatePath(template + '\\_table.sql'),
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
            this.templatePath(template + '\\_table.h'),
            this.libraryPath(this.properties.tableClassName + '.h'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath(template + '\\_table.cpp'),
            this.libraryPath(this.properties.tableClassName + '.cpp'),
            this.properties
        );
        this.fs.copy(
            this.libraryPath(this.properties.libraryName + 'Interface.cpp'),
            this.libraryPath(this.properties.libraryName + 'Interface.cpp'),
            { process: (contents) => { return this.addToInterface(contents); } }
        );
        this.fs.copy(
            this.libraryPath(this.properties.libraryName + '.vcxproj'),
            this.libraryPath(this.properties.libraryName + '.vcxproj'),
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