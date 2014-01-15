/*jshint node:true */

"use strict";

var fs     = require("fs"),
    
    _regex = /\r?\n$/;

module.exports = function(file) {
    return fs.readFileSync(file, "utf8").replace(_regex, "");
};
