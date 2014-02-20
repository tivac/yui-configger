/*jshint node:true */

"use strict";

var fs         = require("fs"),
    path       = require("path"),
    esprima    = require("esprima"),
    estraverse = require("estraverse"),
    
    syntax     = estraverse.Syntax,
    Module;

// Expects a file path & a file type
Module = function(args) {
    if(!args) {
        args = {};
    }
    
    if(!args.file || !args.type) {
        throw new Error("Must specify both file & type");
    }

    this._file = args.file;
    this._type = args.type;
    this._src  = fs.readFileSync(this._file, "utf-8");
    this._name = args.name;
    
    // _parse sets _name & _config
    this._parse();
};

Module.prototype = {
    // Getters & Setters
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

    get valid() {
        var call;

        // No need to validate CSS, assume it's cool
        if(this.type === "css") {
            return true;
        }

        estraverse.traverse(this._ast, {
            enter : function enter(node) {
                if(node.type === syntax.CallExpression &&
                   node.callee &&
                   node.callee.object &&
                   node.callee.object.type === syntax.Identifier &&
                   node.callee.object.name === "YUI" &&
                   node.callee.property.type === syntax.Identifier &&
                   node.callee.property.name === "add" &&
                   node.arguments &&
                   node.arguments.length) {
                    call = node;
                
                    this["break"]();
                }
            }
        });
        
        return call;
    },
    
    // Prototype FNs
    _parse : function() {
        return this["_parse" + (this._type === "css" ? "Css" : "Js")]();
    },

    _parseJs : function() {
        var ast, call, name, config;
        
        try {
            ast = esprima.parse(this._src);
            this._ast = ast;
        } catch(e) {
            return "Unable to parse: " + this._file;
        }

        // validate that this is a bare YUI module
        call = this.valid;

        if(!call) {
            return;
        }

        // determine module name
        if(!call.arguments[0].type ||
            call.arguments[0].type !== syntax.Literal ||
            typeof call.arguments[0].value !== "string") {
            
            return "Module has no name";
        } else {
            name = call.arguments[0].value;
        }
        
        // get module config, or create a blank one
        if(call.arguments.length < 4) {
            config = {
                type       : "ObjectExpression",
                properties : []
            };
        } else {
            config = call.arguments[3];
        }
        
        this._addPath(config);
        
        this._name   = name;
        this._config = config;

        return config;
    },

    _parseCss : function() {
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
    },

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

module.exports = Module;
