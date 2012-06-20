#!/usr/bin/env node
/*global require, module, exports, process */
var argv = require("optimist")
        .usage("Generate a YUI config.\nUsage: $0 -r [dir] -f [filter] -t [file] -o [file]")
        .options(require("../config.js"))
        .argv,

    Configger = require("./configger.js"),
    instance  = new Configger(argv),
    generated = instance.run();

if(argv.output) {
    console.log('TODO: Write generated output to ' + argv.output);
} else {
    console.log(generated); //TODO: REMOVE DEBUGGING
}
