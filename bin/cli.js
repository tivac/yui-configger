#!/usr/bin/env node
/*jshint node:true */

"use strict";

var argv = require("optimist")
        .usage("Generate a YUI config.\nUsage: $0 -r [dir] -f [filter] -t [file] -o [file]")
        .options(require("./args.json"))
        .argv,

    Configger = require("../lib/configger.js"),
    configger = new Configger(argv),
    output    = configger.run();

if(argv.output) {
    console.log('TODO: Write generated output to ' + argv.output);
} else {
    console.log(output); //TODO: REMOVE DEBUGGING
}
