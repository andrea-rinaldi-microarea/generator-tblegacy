/*
generator-tblegacy - scaffolding of TB Legacy C++ applications 
Copyright (C) 2017 Microarea s.p.a.
This program is free software: you can redistribute it and/or modify it under the 
terms of the GNU General Public License as published by the Free Software Foundation, 
either version 3 of the License, or (at your option) any later version.
This program is distributed in the hope that it will be useful, 
but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
or FITNESS FOR A PARTICULAR PURPOSE. 
See the GNU General Public License for more details.
*/

const nodeFs = require('fs');
const _ = require('lodash');
const path = require('path');
const utils = require('./text-utils');
const parseKVP = require('parse-key-value');

module.exports = {

    noEmpty(element) {
        if (!element) {
            return "Empty value not allowed";
        }

        return true;
    },

    valid4CharsCode(value) {
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
    },

    validNewFSName(type, root, name, ext) {
        if (!name) {
            return "Empty name not allowed";
        }

        if (nodeFs.existsSync(root + '\\' + name + (ext ? ext : ''))) {
            return _.capitalize(type) + ' "' + name + '" already exists, please choose another name.';
        }

        var fNamePattern = /^[a-z0-9_-\s]+$/gi;
        if (!fNamePattern.test(name)) {
            return "Invalid characters in " + _.lowerFirst(type) + " name.";
        }

        if (_.includes(name, ' ')) {
            return _.capitalize(type) + " name must not contain spaces.";
        }

        return true;
    },

    validIdentifierName(type, name) {
        if (!name) {
            return "Empty name not allowed";
        }

        var fNamePattern = /^[a-z0-9_\s]+$/gi;
        if (!fNamePattern.test(name)) {
            return "Invalid characters in " + _.lowerFirst(type) + " name.";
        }

        if (_.includes(name, ' ')) {
            return _.capitalize(type) + " name must not contain spaces.";
        }

        return true;
    },

    validExistingFSName(type, root, name, ext) {
        if (!name) {
            return "Empty name not allowed";
        }
        var p = root + '\\' + name + (ext ? ext : '');
        if (!nodeFs.existsSync(root + '\\' + name + (ext ? ext : ''))) {
            return _.capitalize(type) + " " + name + " does not exist.";
        }
        return true;
    },

    validExistingDocNamespace(root, namespace) {
        if (!namespace) {
            return "Empty namespace not allowed";
        }
        var segments = namespace.split(".");
        if (segments.length != 4) {
            return "Document namespace must have the form: <application>.<module>.<library>.<document>";
        }

        var check = this.validExistingFSName("Application", root, segments[0], "\\Application.config");
        if (check !== true)
            return check;
        check = this.validExistingFSName("Module", root + "\\" + segments[0], segments[1], "\\Module.config");
        if (check !== true)
            return check;
        check = this.validExistingFSName("Library", root + "\\" + segments[0] + "\\" + segments[1], segments[2]);
        if (check !== true)
            return check;
        check = this.validExistingFSName("Document", root + "\\" + segments[0] + "\\" + segments[1] + "\\ModuleObjects", segments[3], "\\Description\\Document.xml");
        if (check !== true)
            return check;

        return true;
    },

    validExistingTableNamespace(root, namespace) {
        if (!namespace) {
            return "Empty namespace not allowed";
        }
        var segments = namespace.split(".");
        if (segments.length != 4) {
            return "Table namespace must have the form: <application>.<module>.<library>.<table>";
        }

        var check = this.validExistingFSName("Application", root, segments[0], "\\Application.config");
        if (check !== true)
            return check;
        check = this.validExistingFSName("Module", root + "\\" + segments[0], segments[1], "\\Module.config");
        if (check !== true)
            return check;
        if (segments[2] !== "codeless") {
            check = this.validExistingFSName("Library", root + "\\" + segments[0] + "\\" + segments[1], segments[2]);
            if (check !== true)
                return check;
        }
        check = this.validExistingFSName("Table", root + "\\" + segments[0] + "\\" + segments[1] + "\\DatabaseScript\\Create\\All" , segments[3], ".sql");
        if (check !== true)
            return check;

        return true;
    },

    allModules(root, appName) {
        var appPath = path.join(root, appName);
        var modules = [];
        if (nodeFs.existsSync(appPath)) {
            nodeFs.readdirSync(appPath).forEach(function(entry) {
                var entry_path = path.join(appPath, entry);
                if  (
                        nodeFs.lstatSync(entry_path).isDirectory() &&
                        nodeFs.existsSync(path.join(entry_path, "Module.config"))
                    ) {
                    modules.push(path.basename(entry_path));
                }
            });
        }

        return modules;
    },

    enumAttributes(root, appName, enumName) {
        var modules = this.allModules(root, appName);
        var attributes = null;
        for ( let mod of modules) {
            var attributesText = utils.extractInfo(path.join(root, appName, mod, 'ModuleObjects\\Enums.xml'), `<Tag name="${enumName}"`, '>');
            if (attributesText) {
                var attributes = parseKVP(attributesText.replace(/\" /g, '";'));                    
                attributes.name = enumName;
                attributes.module = mod;
                break;
            }
        }
        return attributes;
    }
}