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
const _ = require('lodash');
const xmlPretty = require('prettify-xml');
const sqlPretty = require('sql-formatter');

module.exports = {

    XML_CONTENT: "XML",
    SQL_CONTENT: "SQL",

    insertInSource(source, actions, content) {
        var result = source;
        for (a = 0; a < actions.length; a++) {

            if (actions[a].skipIfAlreadyPresent) {
                if (result.indexOf(actions[a].textToInsert) != -1) {
                    continue;
                }
            }
            var start = 0;
            if (actions[a].after) {
                start = result.toLowerCase().indexOf(actions[a].after.toLowerCase());
                if (start == -1) {
                    continue;
                }
                start += actions[a].after.length;
            }
            if (!actions[a].justBefore) { // if justBefore is null, append
                result += actions[a].textToInsert;
            } else {
                var ip = result.indexOf(actions[a].justBefore, start);
                while (ip != -1) {
                    var text = actions[a].textToInsert;
                    if (actions[a].separator) {
                        var lastChar = ip - 1; 
                        if (actions[a].separator.skipTrailingBlanks) while (result[lastChar] == ' ') lastChar--;
                        if (actions[a].separator.ifMatch.test(result.substring(lastChar, lastChar + 1))) {
                            text = actions[a].separator.separateWith + text;
                        }
                    }
                    result = result.substring(0, ip) + 
                    text +
                    result.substring(ip);
    
                    ip = result.indexOf(actions[a].justBefore, ip + actions[a].textToInsert.length + actions[a].justBefore.length);
                    if (!actions[a].allOccurrencies) {
                        break;
                    }
                }
            }
        }
        if (content == this.XML_CONTENT) {
            return xmlPretty(result, {indent: 4});
        } else if (content == this.SQL_CONTENT) {
            return sqlPretty.format(result);
        } else {
            return result;
        }
    },

    replaceInSource(source, actions, content) {
        var result = source;
        for (a = 0; a < actions.length; a++) {

            var start = result.indexOf(actions[a].matchStart);
            if (start == -1) {
                continue;
            }
            var stop = result.indexOf(actions[a].matchEnd, start);
            if (stop == -1) {
                continue;
            }
    
            result =    result.substring(0, start + actions[a].matchStart.length) +
                        actions[a].newContent +
                        result.substring(stop);
        }
        
        if (content == this.XML_CONTENT) {
            return xmlPretty(result, {indent: 4});
        } else if (content == this.SQL_CONTENT) {
            return sqlPretty.format(result);
        } else {
            return result;
        }
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