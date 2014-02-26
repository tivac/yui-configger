/*jshint node:true */
"use strict";

var fs         = require("fs"),
    path       = require("path"),
    
    BaseModule;

// Expects a file path & a file type
BaseModule = module.exports = function BaseModule(args) {
    if(!args) {
        args = {};
    }
    
    if(!args.file) {
        throw new Error("Must specify file");
    }

    this._file   = args.file;
    this._name   = args.name;
    this._src    = fs.readFileSync(args.file, "utf-8");
};

BaseModule.prototype = {
    // Properties
    _baseConfig : {
        type       : "ObjectExpression",
        properties : [ ]
    },

    // Getters
    get file() {
        return this._file;
    },

    get name() {
        return this._name;
    },
    
    get config() {
        if(!this._config) {
            throw new Error("Config has not been generated yet");
        }

        return this._config;
    },

    // Public API Interface
    valid : function() {
        return !!this._src.length;
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

        return config;
    }
};
