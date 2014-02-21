#!/usr/bin/env node
/*jshint node:true */

"use strict";

var fs      = require("fs"),
    path    = require("path"),

    details = require("../package.json"),
    argv    = require("optimist")
                .usage(details.usage)
                .options(require("../args.json"))
                .argv,

    Configger = require("../lib/configger"),
    configger = new Configger(argv),
    output;

if(argv.help) {
    require("optimist").showHelp();

    // if we just used process.exit(1) here it would finish before the console.error
    // was done writing and Ant wouldn't ever see the output
    process.on("exit", function() {
        process.exit(1);
    });
    
    return;
}

output = configger.run();

if(!output) {
    // if we just used process.exit(1) here it would finish before the console.error
    // was done writing and Ant wouldn't ever see the output
    process.on("exit", function() {
        process.exit(1);
    });
    
    return;
}

if(argv.output) {
    var file = path.resolve(argv.output);

    fs.writeFileSync(file, output);
    
    return;
}

console.log(output);
