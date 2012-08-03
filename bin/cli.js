#!/usr/bin/env node
/*jshint node:true */

"use strict";

var fs   = require("fs"),
    path = require("path"),
    argv = require("optimist")
            .usage("Generate a YUI config.\nUsage: $0 -r [dir]")
            .options(require("./args.json"))
            .argv,

    Configger = require("../lib/configger.js"),
    configger = new Configger(argv),
    output    = configger.run(),
    save;

save = function(output) {
    var file = path.resolve(argv.output);

    fs.writeFileSync(file, output);
};

if(argv.output) {
    save(output);
} else {
    console.log(output);
}
