/*jshint node:true */

"use strict";

var fs         = require("fs"),
    path       = require("path"),
    esprima    = require("esprima"),
    estraverse = require("estraverse"),
    escape     = require("escape-regexp-component"),
    syntax     = estraverse.Syntax,
    Module;

// Expects an absolute file path along with a root directory path
Module = function(args) {
    args || (args = {});
    
    this._file = args.file;
    this._root = args.root;
};

Module.prototype = {
    get file() {
        return this._file;
    },
    
    get name() {
        if(!this._name) {
            this.load();
        }
        
        return this._name;
    },
    
    get group() {
        if(!this._group) {
            this.load();
        }
        
        return this._group;
    },
    
    get config() {
        if(!this._config) {
            this.load();
        }
        
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
        var ast, call, name, config, group;
        
        if(!this._src) {
            return;
        }
        
        try {
            ast = esprima.parse(this._src);
            this._ast = ast;
        } catch(e) {
            console.error("Unable to parse: " + this._file);
            console.error(JSON.stringify(e, null, 4));

            return;
        }

        // validate that this is a bare YUI module
        call = this.valid();
        if(!call) {
            return "Invalid YUI module";
        }
        
        // determine module name
        if(call.arguments[0].type !== syntax.Literal) {
            return "Module has no name";
        } else {
            name = call.arguments[0].value;
        }
        
        // get module config, or create a blank one
        if(call.arguments[3].type === syntax.ObjectExpression) {
            config = call.arguments[3];
        } else {
            config = {
                type       : "ObjectExpression",
                properties : []
            };
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
        
        // build up group name
        group = path.relative(this._root, path.dirname(this._file));

        // standardize group names across platforms
        group = group.replace(new RegExp(escape(path.sep), "g"), "/");
        if(group.length) {
            group = "/" + group + "/";
        } else {
            group = "/";
        }
        
        this._name   = name;
        this._group  = group;
        this._config = config;
        
        return true;
    },
    
    valid : function() {
        var call;
        
        estraverse.traverse(this._ast, {
            enter : function enter(node) {
                if(node.type === syntax.CallExpression &&
                   node.callee.object.type === syntax.Identifier &&
                   node.callee.object.name === "YUI" &&
                   node.callee.property.type === syntax.Identifier &&
                   node.callee.property.name === "add") {
                    call = this.current();
                
                    this["break"]();
                }
            }
        });
        
        return call;
    }
};

module.exports = Module;
