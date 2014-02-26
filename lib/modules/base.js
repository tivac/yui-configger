/*jshint node:true */

"use strict";

var fs         = require("fs"),
    path       = require("path"),
    
    Module;

// Expects a file path & a file type
Module = module.exports = function Module(args) {
    if(!args) {
        args = {};
    }
    
    if(!args.file) {
        throw new Error("Must specify file");
    }

    this._file = args.file;
    this._name = args.name;
    this._src  = fs.readFileSync(args.file, "utf-8");
};

Module.prototype = {
    // Getters
    get file() {
        return this._file;
    },

    get name() {
        return this._name;
    },
    
    get config() {
        return this._config;
    },

    // Public API Interface
    valid : function() {
        throw new Error("Should have been overridden");
    },

    // Private API

    // Add module path to its metadata object
    _addPath : function(config) {
        // Use unshift to ensure that the path is the first value
        config.properties.unshift({
            type  : "Property",
            key   : {
                type : "Identifier",
                name : "path"
            },
            value : {
                type  : "Literal",
                value : path.basename(this._file)
            }
        });
    }
};
