/*jshint node:true */

"use strict";

var fs         = require("fs"),
    path       = require("path"),
    esprima    = require("esprima"),
    estraverse = require("estraverse"),
    esquery    = require("esquery"),
    
    syntax     = estraverse.Syntax,
    Module;

// Expects a file path & a file type
Module = function(args) {
    if(!args) {
        args = {};
    }
    
    this._required.forEach(function(field) {
        if(!args[field]) {
            throw new Error("Must specify " + field);
        }
    });

    this._file = args.file;
    this._type = args.type;
    this._src  = fs.readFileSync(this._file, "utf-8");
    this._name = args.name;
    
    // parsers set _config (& _name in the case of YUI modules)
    this._parsers[this._type === "css" ? "css" : "js"].bind(this)();
};

Module.prototype = {
    _required : [ "file", "type" ],

    // Getters
    get file() {
        return this._file;
    },

    get type() {
        return this._type;
    },
    
    get name() {
        return this._name;
    },
    
    get config() {
        return this._config;
    },

    // Public API
    valid : function() {
        // No need to validate CSS, assume it's cool
        if(this.type === "css") {
            return true;
        }

        // JS modules w/ unparse-able ASTs aren't valid
        if(!this._ast) {
            return false;
        }

        // TODO: only checks for YUI.add, doesn't validate name or function
        // TODO: as long as it has an AST, it's valid. If it's a valid YUI module change type to "yui".
        return !!esquery(this._ast, "[object.name='YUI'][property.name='add']").length;
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
    },
    
    _parsers : {
        js : function() {
            var ast, name, config;
            
            try {
                ast = esprima.parse(this._src);
                this._ast = ast;
            } catch(e) {
                return "Unable to parse: " + this._file;
            }

            // validate that this is a bare YUI module
            if(!this.valid()) {
                return;
            }

            ast = esquery(ast, "[arguments]")[0];

            // determine module name
            if(!ast.arguments[0].type ||
                ast.arguments[0].type !== syntax.Literal ||
                typeof ast.arguments[0].value !== "string") {
                
                return "Module has no name";
            } else {
                name = ast.arguments[0].value;
            }
            
            // get module config, or create a blank one
            if(ast.arguments.length < 4) {
                config = {
                    type       : "ObjectExpression",
                    properties : []
                };
            } else {
                config = ast.arguments[3];
            }
            
            this._addPath(config);
            
            this._name   = name;
            this._config = config;

            return config;
        },

        css : function() {
            var config = {
                    type       : "ObjectExpression",
                    properties : [ {
                        type  : "Property",
                        key   : {
                            type : "Identifier",
                            name : "type"
                        },
                        value : {
                            type  : "Literal",
                            value : "css"
                        }
                    } ]
                };

            this._addPath(config);

            this._config = config;

            return config;
        }
    }
};

module.exports = Module;
