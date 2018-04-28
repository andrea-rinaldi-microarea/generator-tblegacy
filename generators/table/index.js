const Generator = require('yeoman-generator');
var optionOrPrompt = require('yeoman-option-or-prompt');
const chalk = require('chalk');
const _ = require('lodash');
const nodeFs = require('fs');

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.argument('tableName', { type: String, required: false });

        this.optionOrPrompt = optionOrPrompt;

        this.validTableName = function(name) {
            if (!name) {
                return "Empty name not allowed";
            }

            if (nodeFs.existsSync(this.destinationRoot() + '\\DatabaseScript\\Create\\All\\' + name + '.sql' )) {
                return "Table " + name + " already exists, please choose another name.";
            }

            var fNamePattern = /^[a-z0-9_-\s]+$/gi;
            if (!fNamePattern.test(name)) {
                return "Invalid characters in table name, must be a valid file name.";
            }

            if (_.includes(name, ' ')) {
                return "Table name must not contain spaces.";
            }

            return true;
        }

        this.validLibrary = function(name) {
            if (!name) {
                return "Empty name not allowed";
            }
            if (!nodeFs.existsSync(this.destinationRoot() + '\\' + name)) {
                return "Library " + name + " does not exist.";
            }
            return true;
        }

        this.insertInSource = function(source, textToInsert, justBefore) {
            var ip = source.indexOf(justBefore);
            return  source.substring(0, ip) + 
                    textToInsert +
                    source.substring(ip);
        }

        this.addToCreateInfo = function(contents) {
            var lastStep = contents.toString().split('</Level1>')[0].lastIndexOf('numstep="');
            var numStep = (lastStep != -1) ? contents.toString().split('</Level1>')[0].substring(lastStep).split('"')[1] : "0";
            this.properties['numStep'] = _.parseInt(numStep) + 1;

            var source = contents.toString();
            source = this.insertInSource(
                source,
                '<Step numstep="'+ this.properties.numStep +'" script="' + this.properties.tableName + '.sql" />\n',
                '</Level1>'
            );
            return source;
        }
    
        this.addToInterface = function(contents) {
            var source = contents.toString();
            source = this.insertInSource(
                source,
                '#include "' + this.properties.tableClassName +'.h"\n',
                '\n#ifdef _DEBUG'
            );
            source = this.insertInSource(
                source,
                'REGISTER_TABLE		(' + this.properties.tableClassName + ')\n',
                'END_REGISTER_TABLES'
            );

            return source;
        }

        this.addToProj = function(contents) {
            var source = contents.toString();
            source = this.insertInSource(
                source,
                '<ClCompile Include="' + this.properties.tableClassName + '.cpp" />\n',
                '<ClCompile Include='
            );

            return source;
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
        this.log('Welcome to the ' + chalk.red('TBLegacy Table') + ' generator!');
        this.log('You are about to add a table to the ' + chalk.bold(this.options.moduleName) + ' module of the ' + chalk.bold(this.options.appName) + ' application.' )
        const prompts = [ {
            name: 'tableName',
            message: 'What is your table name ?',
            default: this.options.tableName,
            validate: (input, answers) => { return this.validTableName(input); }
        },{
            name: 'library',
            message: 'Which is the hosting library ?',
            default: this.options.moduleName + 'Dbl',
            validate: (input, answers) => { return this.validLibrary(input); }
        }];

        return this.optionOrPrompt(prompts).then(properties => {
            this.properties = properties;
            this.properties["tableBaseName"] = (this.properties.tableName[2] == '_') ? 
                                                    this.properties.tableName.substring(3) : 
                                                    this.properties.tableName;

            this.properties["tableClassName"] = 'T' + this.properties.tableBaseName;
        });
    }    

    writing() {
        this.destinationRoot(this.contextRoot);
        // SQL scripts
        this.fs.copyTpl(
            this.templatePath('_table.sql'),
            this.destinationPath('DatabaseScript\\Create\\All\\' + this.properties.tableName + '.sql'),
            this.properties
        );
        this.fs.copy(
            this.destinationPath('DatabaseScript\\Create\\CreateInfo.xml'),
            this.destinationPath('DatabaseScript\\Create\\CreateInfo.xml'),
            { process: (contents) => { return this.addToCreateInfo(contents); } }
        );

        // Source code
        this.fs.copyTpl(
            this.templatePath('_table.h'),
            this.destinationPath(this.properties.library + '\\' + this.properties.tableClassName + '.h'),
            this.properties
        );
        this.fs.copyTpl(
            this.templatePath('_table.cpp'),
            this.destinationPath(this.properties.library + '\\' + this.properties.tableClassName + '.cpp'),
            this.properties
        );
        this.fs.copy(
            this.destinationPath(this.properties.library + '\\' + this.properties.library + 'Interface.cpp'),
            this.destinationPath(this.properties.library + '\\' + this.properties.library + 'Interface.cpp'),
            { process: (contents) => { return this.addToInterface(contents); } }
        );
        this.fs.copy(
            this.destinationPath(this.properties.library + '\\' + this.properties.library + '.vcxproj'),
            this.destinationPath(this.properties.library + '\\' + this.properties.library + '.vcxproj'),
            { process: (contents) => { return this.addToProj(contents); } }
        );

    }    
}