#!/usr/bin/env node

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

var yeoman = require('yeoman-environment');
var GeneratorApp = require('./generators/app/index.js');
var GeneratorMod = require('./generators/module/index.js');
var GeneratorLib = require('./generators/library/index.js');
var GeneratorDoc = require('./generators/document/index.js');
var GeneratorTbl = require('./generators/table/index.js');
var GeneratorCD = require('./generators/clientdoc/index.js');
var GeneratorFld = require('./generators/field/index.js');
var GeneratorEnum = require('./generators/enum/index.js');
var GeneratorDBT = require('./generators/dbt/index.js');
var banner = require('./banner');

var usage = function(args) {
    banner();
    console.log('\nUsage:');
    console.log('\ttbl n(ew) [appName]');
    console.log('\ttbl m(od) [modName]');
    console.log('\ttbl l(ib) [libName]');
    console.log('\ttbl t(able) [tableName]');
    console.log('\ttbl f(ield) [fieldName]');
    console.log('\ttbl d(oc) [docName]');
    console.log('\ttbl b|dbt [dbtName]');
    console.log('\ttbl cd|clientdoc [clientDocName]');
    console.log('\ttbl e(num) [enumName]');
}

var env = yeoman.createEnv();
env.registerStub(GeneratorApp, 'tbl:app');
env.registerStub(GeneratorMod, 'tbl:module');
env.registerStub(GeneratorLib, 'tbl:library');
env.registerStub(GeneratorDoc, 'tbl:document');
env.registerStub(GeneratorTbl, 'tbl:table');
env.registerStub(GeneratorFld, 'tbl:field');
env.registerStub(GeneratorCD, 'tbl:clientdoc');
env.registerStub(GeneratorEnum, 'tbl:enum');
env.registerStub(GeneratorDBT, 'tbl:dbt');

var args = process.argv.slice(2);
if (args.length < 1) return usage(args);

var gen;
var tpl = require('path').dirname(process.argv[1]) + "\\generators";
if (args[0] === 'new' || args[0] === 'n') {
    gen = 'tbl:app';
    tpl = tpl + '\\app\\templates';
} else if (args[0] === 'mod' || args[0] === 'm') {
    gen = 'tbl:module';
    tpl = tpl + '\\module\\templates';
} else if (args[0] === 'lib' || args[0] === 'l') {
    gen = 'tbl:library';
    tpl = tpl + '\\library\\templates';
} else if (args[0] === 'doc' || args[0] === 'd') {
    gen = 'tbl:document';
    tpl = tpl + '\\document\\templates';
} else if (args[0] === 'table' || args[0] === 't') {
    gen = 'tbl:table';
    tpl = tpl + '\\table\\templates';
} else if (args[0] === 'field' || args[0] === 'f') {
    gen = 'tbl:field';
    tpl = tpl + '\\field\\templates';
} else if (args[0] === 'clientdoc' || args[0] === 'cd') {
    gen = 'tbl:clientdoc';
    tpl = tpl + '\\clientdoc\\templates';
} else if (args[0] === 'enum' || args[0] === 'e') {
    gen = 'tbl:enum';
    tpl = tpl + '\\enum\\templates';
} else if (args[0] === 'dbt' || args[0] === 'b') {
    gen = 'tbl:dbt';
    tpl = tpl + '\\enum\\templates';
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

