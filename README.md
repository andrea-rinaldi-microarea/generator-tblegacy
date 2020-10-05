# generator-tblegacy
This generator helps you to scaffold TaskBuilder Studio C++ applications, or part of them.  
It is a [Yeoman Generator](https://yeoman.io/) available also as a CLI.
## Prerequisites
To use this generator you need [Node.js](https://nodejs.org/en/) 8.9 or higher.  

It scaffolds Task Builder Studio applications in their predefined folder structure, so it is recommended to have TB Studio installed, and the ERP solution compiled and working.  
This allows to make immediate use of the scaffolded applications. 
## Installation
Clone the repository:
```
git clone https://github.com/andrea-rinaldi-microarea/generator-tblegacy.git
```
move in the folder and install dependencies
```
npm install
```
Create a symbolik link to the CLI:
```
npm link
```
*Note on npm link*: for the command to be correctly generated, the starting source (i.e.: `tbl-cli.js`) **MUST** start with `#!/usr/bin/env node`) 
## Usage
If you have Yeoman installed, you can invoke it as any other generator:
```
yo tblegacy
```
Alternatively, you can use it as a CLI:
```
tbl
-- or --
tbl-cli
```
Available commands:
* `tbl n(ew) [appName]` scaffold a new [application](#Application)
* `tbl m(od) [modName]` scaffold a [module](#Modules)
* `tbl l(ib) [libName]` scaffold a [library](#Libraries)
* `tbl t(able) [tableName]` scaffold a [table](#Tables)
* `tbl f(ield) [fieldName]` scaffold a new table [field](#Fields)
* `tbl d(oc) [docName]` scaffold a document
* `tbl cd|clientdoc [clientdocName]` scaffold a client document
* `tbl e(num) [enumName]` scaffold an [enum definition](#Enums)
## Application
To scaffold a new application, your current folder must be inside the predefined TB Studio `Applications` folder, that is:
```
[instance folder]\Standard\Applications
```
You choose the instance folder during the TB Studio installation, the default is `C:\Development`.

The generator asks for a number of parameters; those worth to mention are:  

**Organization**: the name of your company, which will appear in the license and brand files.  

**Application Name**: the application name is used to name its containing folder (inside `Standard\Applications`), so it must be a valid non-existing folder name. It may contains only letters, numbers and the characters: `_` (underscore)  `-` (minus).  
These restrictions are due to the TB namespace management.

**Codeless Application**: the application may not need any compiled code, just metadata. An empty VS solution is however scaffolded, in case some need of code arises later.

**Re-use ERP precompiled headers**: as the usual case is that the application extends ERP, it may be useful to re-use ERP precompiled headers to save compilation time (not asked for "codeless" applications).

**Default Module**  
**Default Library**: the new application is scaffolded with at least one module and one library inside it, so that it is immediately usable.  
Other modules and libraries can be added later (the default library is not asked for "codeless" applications).

**Module 4-chars short name**: these 4 characters are used as a seed for the generation of the module's serial number, which can be done through the [specific page](http://www.microarea.it/Prodotti/Verticalizzazioni/SerialNumbersGenerator.aspx) of the Microarea portal (requires login).

### Scaffolded contents
The generated elements are:
* the application's main folder, along with the `Application.config` file
* the VS solution and its `.props` file
* the application's license files, in the `Solutions` subfolder
* the first declared module (see [Modules](#Modules))
* if the application is not "codeless", the first declared library inside it. (see [Libraries](#Libraries))

### Next steps
To make the scaffolded application working:
* open in VS 2017 the `.sln` file and compile it (not needed for "codeless" applications)
* register the application in the [Microarea portal](http://www.microarea.it/int/Prodotti/Verticalizzazioni/PreInsertScheda.aspx)
* crypt the default module definition (`Solutions\Modules\[default module].xml`), and download the returned `.csm` file in the same folder
* generate at least one serial number for your application, from the [specific page](http://www.microarea.it/Prodotti/Verticalizzazioni/SerialNumbersGenerator.aspx) of the portal
* restart IIS to make the LoginManager web services reload the list of available applications
* launch the Administration Console and activate the new application entering the serial number
* upgrade the companies databases; even if there are no new tables present, it is needed to "brand" the DB with the new application

Launching Mago, the application's menu should appear among the others. You may need to hit the "refresh" icon (upper-right corner, next to the user icon) to force a cache clear.

## Modules
To scaffold a new module, your current folder must be inside an existing application, that is:
```
[instance folder]\Standard\Applications\[application]
```
i.e: `C:\Development\Standard\Applications\MyApp`.

The generator asks for a number of parameters; those worth to mention are:  

**Module Name**: the module name is used to name its containing folder (inside the application folder), so it must be a valid non-existing folder name. It may contains only letters, numbers and the characters: `_` (underscore)  `-` (minus).  
These restrictions are due to the TB namespace management.

**Module 4-chars short name**: these 4 characters are used as a seed for the generation of the module's serial number, which can be done through the [specific page](http://www.microarea.it/Prodotti/Verticalizzazioni/SerialNumbersGenerator.aspx) of the Microarea portal (requires login).

### Scaffolded contents
The generated elements are:
* the module's license files, in the `Solutions\Modules` subfolder of the application. The `.Solution.xml` file is updated to include the new module.
* the module's folder, along with the `Module.config` file
* the `Databasecript` folder, with empty `Create` and `Update` configuration files
* a default empty `Menu`, with a default `.png` image to represent the module in the main menu
* the `ModuleObjects` folder, with empty metadata files for `DocumentObjects`, `AddOnDatabaseObjects`, `ClientDocumentObjects`, `DatabaseObjects`, `Enums` and `EventHandlerObjects`

## Libraries
To scaffold a new library, your current folder must be inside an existing module, that is:
```
[instance folder]\Standard\Applications\[application]\[module]
```
i.e: `C:\Development\Standard\Applications\MyApp\MainModule`.

The generator asks for a number of parameters; those worth to mention are:  

**Library Name**: the library name is used to name its containing folder (inside the module folder), so it must be a valid non-existing folder name. It may contains only letters, numbers and the characters: `_` (underscore)  `-` (minus).  
These restrictions are due to the TB namespace management.

**Re-use ERP precompiled headers**: as the usual case is that the library make use of some resource defined in ERP, it may be useful to re-use ERP precompiled headers to save compilation time.
### Scaffolded contents
The generated elements are:
* the library's folder
* basic files in it: `stdafx.h`, `[library].cpp`, `interface.cpp`
* the VS project file, `.vcxproj`
* the `module.config` of the containing module is updated to include the library
* the VS solution `.sln` of the application is upodated to include the `.vcxproj` of the library

## Tables
The table generator let you generate the required metadata and the code wrapper to manage a table in your application.  
It is possible to generate a single table, master-only style, or a table pair, master/detail style, such as a document with an header and some rows.

To scaffold a new table, your current folder must be inside an existing module, that is:
```
[instance folder]\Standard\Applications\[application]\[module]
```
i.e: `C:\Development\Standard\Applications\MyApp\MainModule`.

The generator asks for a number of parameters; those worth to mention are:  

**Table name**: the physical name of the table, that is, the name that will be used for the DB. It must be a non-existing valid name, which cannot include spaces or special characters, as it is used also to generate the name for the `SQLRecord` class 

**Codeless table**: the table is defined via metadata only, there is no C++ wrapper class. *Note: a codeless table can exists in a non-codeless application, but the vice-versa is not supported out-of-the-box*.

**Hosting Library**: the library in which host the code for the table's `SQLRecord`. It must be an already existing library inside the current module (not asked for "codeless" tables).

**Table type**: it allows to choose among *master* and *master/detail*. In the latter, actually a pair of tables are generated, one intended to be a header, the other to contain lines; it has  the same name, with a `Detail` suffix attached 

*Note on the table name*: if the pysical name respects the standard prefixed format `[AA]_[name]`, `[name]` is extracted as a *base* name to generate to class name. I.e.: if the phisical table name is `SB_Contracts`, the `SQLRecord` class will be named `TContracts`, the source files will be named `TContracts.h` and `TContracts.cpp`, and so on.

### Scaffolded contents
The generated elements are:
* the SQL scripts in the `DatabaseScript\Create` subfolder. The `CreateInfo.xml` file is updated to include the new table.
* the `DatabaseObjects.xml` and `EFSchemaObjects.xml` files are updated to include the new table

*the following steps are not executed for codeless tables*
* the `.h` and `.cpp` source file defining the `SQLRecord` class for the table
* the `Interface.cpp` file is updated with the table class registration in the catalog
* the VS project `.vcxproj` is updated to compile the `SQLRecord` source code

## Fields
The field generator lets you generate and adjust the code template to manage a new field in a table of your application.  
It is possible to generate a single field, of one of the predefined data types.

***WARNING**: the field generator works only for "codeless" tables.*

To scaffold a new field, your current folder must be inside an existing module, that is:
```
[instance folder]\Standard\Applications\[application]\[module]
```
i.e: `C:\Development\Standard\Applications\MyApp\MainModule`.

The generator asks for a number of parameters; those worth to mention are:

**Table phisical name**: the physical name of the table to add the new field to. It must be a existing table name, it is checked against the corresponding creation SQL script. 

**Field name**: the name of the new field in the database. It must be a valid identifier, no spaces or special characters are allowed.

**Field type**: the type of the new field, out of a list of allowed types. For fields of `string` type, it is requested to enter also the length; For fields of `enum` type it is requested the name of the enum to associate to the new field.

**Require an upgrade step**: if the answer is `yes`, the field will be added causing an upgrade step for the DB. Otherwise, the field will be added in the last DB upgrade step found. This ease adding more than one field in a session, by setting the DB step for the first field added, and then attaching the others to same step. 

### Scaffolded contents
The generated and modified elements are:
* the `DatabaseObjects.xml` and `EFSchemaObjects.xml` files are updated to include the new field in the corresponding table. The release number is also increased by 1
* the SQL script for the table creation is updated to include the new field
* the SQL script to upgrade the table is created in `DatabaseScript\Upgrade` subfolder. The `UpgradeInfo.xml` is also updated.

## Enums
The enum generator lets you generate the definition of an enum data type, that is a list of possible values for a property. Such type is mapped in the DB as a column of `int` type.

***WARNING**: the enum generator works only for "codeless" applications.*

To scaffold a new enum, your current folder must be inside an existing module, that is:
```
[instance folder]\Standard\Applications\[application]\[module]
```
i.e: `C:\Development\Standard\Applications\MyApp\MainModule`.

The generator asks for a number of parameters; those worth to mention are:

**Enum name**: the name of the new enum. It must be unique for the whole application.

**Base value**: the enum values are represented as `int` numbers, starting from a seed. This is the seed of the enum, the actual values will be generated as `base << 16 + value`. I.e. a base of `512` will generate values such as `33554432`, `33554433`, etc.

**Number of values**: this indicates how many different values the enum will contain.

### Scaffolded contents
The generator updates the `Enums.xml` file to include the new enum definition.
