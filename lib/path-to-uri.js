/*jshint node:true */

"use strict";

var sepRegex = /\\/g,
    dotRegex = /^\.+/g;

module.exports = function(input) {
    if(typeof input !== "string") {
        return input;
    }
    
    input = input
            .replace(sepRegex, "/")
            .replace(dotRegex, "");
    
    if(input.substr(0, 1) !== "/") {
        input = "/" + input;
    }
    
    if(input.substr(-1) !== "/") {
        input += "/";
    }
    
    return input;
};
