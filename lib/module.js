/*jshint node:true */

"use strict";

var fs         = require("fs"),
    path       = require("path"),
    esprima    = require("esprima"),
    estraverse = require("estraverse"),
    
    syntax     = estraverse.Syntax,
    Module;

// Expects an absolute file path along with a root directory path
Module = function(args) {
    args || (args = {});
    
    this._file = args.file;
    
    if(this._file) {
        this.load();
    }
};

Module.valid = function(ast) {
    var call;
    
    estraverse.traverse(ast, {
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
};

Module.prototype = {
    valid : false,
    
    get file() {
        return this._file;
    },
    
    set file(file) {
        this._file = file;
        
        this.load();
    },
    
    get name() {
        return this._name;
    },
    
    get config() {
        return this._config;
    },
    
    load : function() {
        this._read();
        
        return this._parse();
    },
    
    _read : function() {
        this._src = fs.readFileSync(this._file, "utf-8");
    },
    
    _parse : function() {
        var ast, call, name, config;
        
        if(!this._src) {
            return;
        }
        
        try {
            ast = esprima.parse(this._src);
            this._ast = ast;
        } catch(e) {
            return "Unable to parse: " + this._file;
        }

        // validate that this is a bare YUI module
        call = Module.valid(ast);
        if(!call) {
            return "Invalid YUI module";
        }
        
        // determine module name
        if(!call.arguments[0].type ||
            call.arguments[0].type !== syntax.Literal ||
            typeof call.arguments[0].value !== "string") {
            
            return "Module has no name";
        } else {
            name = call.arguments[0].value;
        }
        
        this.valid = true;
        
        // get module config, or create a blank one
        if(call.arguments.length < 4) {
            config = {
                type       : "ObjectExpression",
                properties : []
            };
        } else {
            config = call.arguments[3];
        }
        
        // Add module path to its meta
        config.properties.unshift({
            type : "Property",
            key  : {
                type : "Identifier",
                name : "path"
            },
            value : {
                type  : "Literal",
                value : path.basename(this._file)
            }
        });
        
        this._name   = name;
        this._config = config;
        
        return this.valid;
    }
};

module.exports = Module;
