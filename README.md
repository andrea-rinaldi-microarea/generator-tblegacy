# generator-tblegacy
This generator helps you to scaffold TaskBuilder Studio C++ applications, or part of them.  
It is a [Yeoman Generator](https://yeoman.io/) available also as a CLI.
## Prerequisites
To use this generator you need [Node.js](https://nodejs.org/en/) 8.9 or higher.  

It scaffolds Task Builder Studio applications in their predefined folder structure, so it is reccommended to have TB Studio installed, and the ERP solution compiled and working.  
This allows to make immediate use of the scaffolded applications. 
## Installation
Clone the repository:
```
git clone 
```
move in the folder and install dependencies
```
npm install
```
Create a symbolik link to the CLI:
```
npm link
```
## Usage
If you have Yeaoman installed, you can invoke it as any other generator:
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
* `tbl n(ew) [appName]` scaffold a new application
* `tbl m(od) [modName]` scaffold a module
* `tbl l(ib) [libName]` scaffold a library
* `tbl t(able) [tableName]` scaffold a table
* `tbl d(oc) [docName]` scaffold a document
* `tbl cd|clientdoc [clientdocName]` scaffold a client document
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

**Re-use ERP precompiled headers**: as the usual case is that the application extends ERP, it may be useful to re-use ERP precompiled headers to save compilation time.

**Default Module**  
**Default Library**: the new application is scaffolded with at least one module and one library inside it, so that it is immediately usable.  
Other modules and libraries can be added later.

**Module 4-chars short name**: these 4 characters are used as a seed for the generation of the module's serial number, which can be done through the [specific page](http://www.microarea.it/Prodotti/Verticalizzazioni/SerialNumbersGenerator.aspx) of the Microarea portal (requires login).

### Scaffolded contents
The generated elements are:
* the application's main folder, along with the `Application.config` file
* the VS solution and its `.props` file
* the application's license files, in the `Solutions` subfolder
* the first declared module (see [Modules](#Modules))
* the first declared library inside it (see [Libraries](#Libraries))

## Modules

## Libraries