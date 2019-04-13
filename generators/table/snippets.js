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

var snippets = module.exports = {};

snippets.databaseObj = {
    master: {
        masterFields:
            '\t\t\t<Column name="Code" localize="Code" lenght="10" type="string" defaultvalue="" release="1" />\n' +
            '\t\t\t<Column name="Description" localize="Description" lenght="128" type="string" defaultvalue="" release="1" />\n'
    },

    masterDetails : {
        masterFields:
            '\t\t\t<Column name="DocID" localize="Doc ID" lenght="0" type="Long" defaultvalue="0" release="1" />\n' +
            '\t\t\t<Column name="DocNo" localize="Doc Number" lenght="10" type="string" defaultvalue="" release="1" />\n'+
            '\t\t\t<Column name="DocDate" localize="Doc Date" lenght="10" type="date" defaultvalue="1799-12-31T00:00:00" release="1" />\n'+
            '\t\t\t<Column name="LastSubId" localize="Last SubId" lenght="0" type="Long" defaultvalue="0" release="1" />\n'

        , detailsFields:
            '\t\t\t<Column name="DocID" localize="Doc ID" lenght="0" type="Long" defaultvalue="0" release="1" />\n' +
            '\t\t\t<Column name="DocSubId" localize="Doc SubId" lenght="0" type="Long" defaultvalue="0" release="1" />\n'+
            '\t\t\t<Column name="Code" localize="Code" lenght="10" type="string" defaultvalue="" release="1" />\n' +
            '\t\t\t<Column name="Description" localize="Description" lenght="128" type="string" defaultvalue="" release="1" />\n'
    }
}