#!/usr/bin/env node
var yeoman = require('yeoman-environment');
var GeneratorApp = require('./generators/app/index.js');
var GeneratorLib = require('./generators/library/index.js');
var GeneratorDoc = require('./generators/document/index.js');
var GeneratorTbl = require('./generators/table/index.js');
var GeneratorCD = require('./generators/clientdoc/index.js');
var banner = require('./banner');

var usage = function(args) {
    banner();
    console.log('\nUsage:');
    console.log('\ttbl n(ew) [appName]');
    console.log('\ttbl l(ib) [libName]');
    console.log('\ttbl d(oc) [docName]');
    console.log('\ttbl t(able) [tableName]');
    console.log('\ttbl cd|clientdoc [clientDocName]');
}

var env = yeoman.createEnv();
env.registerStub(GeneratorApp, 'tbl:app');
env.registerStub(GeneratorLib, 'tbl:library');
env.registerStub(GeneratorDoc, 'tbl:document');
env.registerStub(GeneratorTbl, 'tbl:table');
env.registerStub(GeneratorCD, 'tbl:clientdoc');

var args = process.argv.slice(2);
if (args.length < 1) return usage(args);

var gen;
var tpl = require('path').dirname(process.argv[1]) + "\\generators";
if (args[0] === 'new' || args[0] === 'n') {
    gen = 'tbl:app';
    tpl = tpl + '\\app\\templates';
} else if (args[0] === 'lib' || args[0] === 'l') {
    gen = 'tbl:library';
    tpl = tpl + '\\library\\templates';
} else if (args[0] === 'doc' || args[0] === 'd') {
    gen = 'tbl:document';
    tpl = tpl + '\\document\\templates';
} else if (args[0] === 'table' || args[0] === 't') {
    gen = 'tbl:table';
    tpl = tpl + '\\table\\templates';
} else if (args[0] === 'clientdoc' || args[0] === 'cd') {
    gen = 'tbl:clientdoc';
    tpl = tpl + '\\clientdoc\\templates';
} else {
    return usage(args);
}
var params = args.slice(1).toString().replace(',',' ');
try {
    env.run(gen + ' ' + params, { 'sourceRoot': tpl, 'force': true }, (err) => {
        if (err) {
            console.log(err.message);
        }
    });
} catch(err) {
    console.log(err);
}

