module.exports = {

    insertInSource(source, actions) {
        var result = source;
        for (a = 0; a < actions.length; a++) {
            var ip = result.indexOf(actions[a].justBefore);
            result = result.substring(0, ip) + 
                     actions[a].textToInsert +
                     result.substring(ip);
        }
        return result;
    }

}