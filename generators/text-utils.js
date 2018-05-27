const nodeFs = require('fs');
const path = require('path');

module.exports = {

    insertInSource(source, actions) {
        var result = source;
        for (a = 0; a < actions.length; a++) {

            if (actions[a].skipIfAlreadyPresent) {
                if (source.indexOf(actions[a].textToInsert) != -1) {
                    continue;
                }
            }
            var ip = result.indexOf(actions[a].justBefore);
            while (ip != -1) {
                result = result.substring(0, ip) + 
                actions[a].textToInsert +
                result.substring(ip);

                ip = result.indexOf(actions[a].justBefore, ip + actions[a].textToInsert.length + actions[a].justBefore.length);
                if (!actions[a].allOccurrencies) {
                    break;
                }
            }
        }
        return result;
    },

    extractPhisicalName(path, className) {
        if (!nodeFs.existsSync(path + "\\" + className + '.cpp')) {
            return className;
        }
        var content = nodeFs.readFileSync(path + "\\" + className + '.cpp').toString();

        var start = content.indexOf('_NS_TBL("');
        if (start == -1) {
            return className;
        }
        var stop = content.indexOf('");', start);
        if (stop == -1) {
            return className;
        }

        return content.substring(start + '_NS_TBL("'.length, stop);
    }

}