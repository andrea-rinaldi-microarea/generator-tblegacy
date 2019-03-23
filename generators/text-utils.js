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