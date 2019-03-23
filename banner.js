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

//                                                                    (     (     
//   *   )              )   (             (   (                  (    )\ )  )\ )  
// ` )  /(    )      ( /( ( )\    (   (   )\  )\ )   (   (       )\  (()/( (()/(  
//  ( )(_))( /(  (   )\()))((_)  ))\  )\ ((_)(()/(  ))\  )(    (((_)  /(_)) /(_)) 
// (_(_()) )(_)) )\ ((_)\((_)_  /((_)((_) _   ((_))/((_)(()\   )\___ (_))  (_))   
// |_   _|((_)_ ((_)| |(_)| _ )(_))(  (_)| |  _| |(_))   ((_) ((/ __|| |   |_ _|  
//   | |  / _` |(_-<| / / | _ \| || | | || |/ _` |/ -_) | '_|  | (__ | |__  | |   
//   |_|  \__,_|/__/|_\_\ |___/ \_,_| |_||_|\__,_|\___| |_|     \___||____||___|  

const chalk = require('chalk');

module.exports = function() {
console.log(chalk.red ("                                                                    (     (   "));  
console.log(chalk.red ("   *   )              )   (             (   (                  (    )\\ )  )\\ )"));  
console.log(chalk.red (" ` )  /(    )      ( /( ( )\\    (   (   )\\  )\\ )   (   (       )\\  (()/( (()/("));  
console.log(chalk.red ("  ( )(_))( /(  (   )\\()))((_)  ))\\  )\\ ((_)(()/(  ))\\  )(    (((_)  /(_)) /(_))")); 
console.log(chalk.red (" (_(_()) )(_)) )\\ ((_)\\((_)_  /((_)((_) _   ((_))/((_)(()\\   )\\___ (_))  (_))"));   
console.log(chalk.blue(" |_   _|")+ chalk.red("(_)_ ((_)")+ chalk.blue(" | |")+ chalk.red("(_)")+ chalk.blue("| _ )")+ chalk.red("(_))(")+ chalk.blue("  (_)| |  _| |")+ chalk.red("(_))   ((_) ((")+ chalk.blue("/ __|| |   |_ _|"));  
console.log(chalk.blue("   | |  / _` |(_-<| / / | _ \\| || | | || |/ _` |/ -_) | '_|  | (__ | |__  | |"));   
console.log(chalk.blue("   |_|  \\__,_|/__/|_\\_\\ |___/ \\_,_| |_||_|\\__,_|\\___| |_|     \\___||____||___|"));  

console.log('\nVersion: ' + require('./package.json').version);
} 