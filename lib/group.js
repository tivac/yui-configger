/*jshint node:true */

"use strict";

var path       = require("path"),
    estraverse = require("estraverse"),
    escape     = require("escape-regexp-component"),
    
    syntax   = estraverse.Syntax,
    sepRegex = new RegExp(escape(path.sep), "g"),
    
    Group;

Group = function(args) {
    this._name     = args.name;
    this._dir      = args.dir;
    this._template = args.template;
    this._existing = args.existing;
    this._prefix   = args.prefix;
    
    this._modules  = [];
};

Group.prototype = {
    get name() {
        return (this._prefix ? this._prefix : "") + this._name;
    },
    
    get dir() {
        var dir = this._dir;
        
        dir = dir.replace(sepRegex, "/");
        dir = dir.replace(/^\./, "");
        
        if(dir.substr(0, 1) !== "/") {
            dir = "/" + dir;
        }
        
        if(dir.substr(-1) !== "/") {
            dir += "/";
        }
        
        return dir;
    },
    
    get modules() {
        return this._modules;
    },
    
    get ast() {
        if(!this._modules.length) {
            return;
        }
        
        // fork based on group state
        if(this._template) {
            return this._templateAST();
        } else if(this._existing) {
            return this._existingAST();
        }
        
        return this._createAST();
    },
    
    _templateAST : function() {
        var self = this,
            ast  = require("clone")(this._template);
        
        // replace $group value with our group name
        estraverse.replace(ast, {
            enter : function enter(node) {
                if(node.type !== syntax.Identifier ||
                   node.name !== "$group") {
                    return;
                }
                
                // Change node type to a string so we don't have to worry
                // about identifier rules
                node.type  = syntax.Literal;
                node.value = self.name;
                node.raw   = "\"" + self.name + "\"";
                
                delete node.name;
                
                this["break"]();
                
                return node;
            }
        });
        
        // replace {dir} instances
        estraverse.replace(ast, {
            enter : function enter(node) {
                if(!node.type || !node.value || !node.value) {
                    return;
                }
                   
                if(node.type !== syntax.Identifier && node.type !== syntax.Literal) {
                    return;
                }
                
                if(typeof node.value !== "string" || node.value.indexOf("{dir}") === -1) {
                    return;
                }
                
                node.value = node.value.replace("{dir}", self.dir);
                
                if(node.type === syntax.Literal && node.raw) {
                    node.raw = node.raw.replace("{dir}", self.dir);
                }
                
                this["break"]();
                
                return node;
            }
        });
        
        // add modules key & module data
        estraverse.replace(ast, {
            enter : function enter(node) {
                if(!node.key) {
                    return;
                }
                
                if(node.key.type !== syntax.Identifier && node.key.type !== syntax.Literal) {
                    return;
                }
                
                if(node.key.name !== self._name && node.key.value !== self._name) {
                    return;
                }
                
                node.value.properties = node.value.properties.concat(self._modulesAST());
                
                this["break"]();
                
                return node;
            }
        });
        
        return ast;
    },
    
    _existingAST : function() {
        
    },
    
    _createAST : function() {
        return {
            type : "Property",
            key  : {
                type  : "Literal",
                value : this.name,
                raw   : "\"" + this.name + "\""
            },
            value : {
                type : "ObjectExpression",
                properties : [
                    this._modulesAST()
                ]
            },
            kind: "init"
        };
    },
    
    _modulesAST : function() {
        return {
            type : "Property",
            key : {
                type : "Identifier",
                name : "modules"
            },
            value : {
                type : "ObjectExpression",
                properties : this._modules.map(function(module) {
                    // ensure modules have loaded themselves
                    if(!module.config) {
                        module.load();
                    }

                    return {
                        type : "Property",
                        key  : {
                            type  : "Literal",
                            value : module.name
                        },
                        value : module.config,
                        kind  : "init"
                    };
                })
            }
        };
    }
};

module.exports = Group;
