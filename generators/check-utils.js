const nodeFs = require('fs');
const _ = require('lodash');

module.exports = {

    validNewFolder(generator, type, name) {
        if (!name) {
            return "Empty name not allowed";
        }

        if (nodeFs.existsSync(generator.destinationRoot() + '\\' + name)) {
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

}