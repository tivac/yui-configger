#!/usr/bin/env node
/*jshint node:true */

"use strict";

var fs   = require("fs"),
    path = require("path"),
    argv = require("optimist")
            .usage("Generate a YUI config.\nUsage: $0 -r [dir]")
            .options(require("../args.json"))
            .argv,

    Configger = require("../lib/"),
    configger = new Configger(argv),
    output    = configger.run();

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
