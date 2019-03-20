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
    }
}