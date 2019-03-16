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

    extractInfo(file, matchStart, matchEnd) {
        if (!nodeFs.existsSync(file)) {
            return false;
        }

        var content = nodeFs.readFileSync(file).toString();

        var start = content.indexOf(matchStart);
        if (start == -1) {
            return false;
        }
        var stop = content.indexOf(matchEnd, start);
        if (stop == -1) {
            return false;
        }

        return content.substring(start + matchStart.length, stop);
    }

}