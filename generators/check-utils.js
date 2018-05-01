const nodeFs = require('fs');
const _ = require('lodash');

module.exports = {

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

    validExistingFSName(type, root, name) {
        if (!name) {
            return "Empty name not allowed";
        }
        if (!nodeFs.existsSync(root + '\\' + name)) {
            return _.capitalize(type) + " " + name + " does not exist.";
        }
        return true;
    }

}