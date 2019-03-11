# generator-tblegacy
This generator helps you scaffold TaskBuilder Studio C++ applications, or part of it.  
It is a Yeoman Generator available also as a CLI.
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
## Usage
If you have Yeaoman installed, yuo can invoke it as any other generator:
```
yo tblegacy
```
Alternatively, you can use it as a CLI:
```
tbl
```
Availbale commands:
* `tbl n(ew) [appName]` scaffold a new application
* `tbl l(ib) [libName]` scaffold a library
* `tbl t(able) [tableName]` scaffold a table
* `tbl d(oc) [docName]` scaffold a document
* `tbl cd|clientdoc [clientdocName]` scaffold a client document
