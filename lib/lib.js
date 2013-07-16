/*jshint node:true */

"use strict";

var path     = require("path"),
    escape   = require("escape-regexp-component"),
    sepRegex = /\\/g;

module.exports = {
    pathFixup : function(path) {
        if(typeof path !== "string") {
            return path;
        }
        
        path = path.replace(sepRegex, "/")
                   .replace(/^\./, "");
        
        if(path.substr(0, 1) !== "/") {
            path = "/" + path;
        }
        
        if(path.substr(-1) !== "/") {
            path += "/";
        }
        
        return path;
    }
};
