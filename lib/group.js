/*jshint node:true */

"use strict";

var estraverse = require("estraverse"),
    lib        = require("./lib.js"),
    
    syntax   = estraverse.Syntax,
    Group;

Group = function(args) {
    this._name     = args.name;
    this._dir      = lib.pathFixup(args.dir);
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
        return this._dir;
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
        this._setBaseRootAST(ast, function(node) {
            debugger;
            
            if(node.value.value.indexOf("{dir}") === -1) {
                return;
            }
            
            node.value.value = node.value.value.replace("{dir}", self.dir);
            
            if(node.value.type === syntax.Literal && node.value.raw) {
                node.value.raw = node.value.raw.replace("{dir}", self.dir);
            }
        });
        
        // add modules key & module data
        this._setModulesAST(ast);
        
        return ast;
    },
    
    _existingAST : function() {
        var self = this,
            ast = this._existing;
        
        this._setBaseRootAST(ast, function(node) {
            node.value.type = syntax.Literal;
            node.value.value = self.dir;
            
            if(node.value.name) {
                delete node.value.name;
            }
        });
        
        this._setModulesAST(ast);

        return ast;
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
                    // Modules w/o a file aren't interesting
                    if(!module.file) {
                        return;
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
    },
    
    _setBaseRootAST : function(ast, replacer) {
        // replace base/root values if they exist
        estraverse.traverse(ast, {
            enter : function enter(node) {
                var parent;
                
                if(!node.type || (node.type !== syntax.Literal && node.type !== syntax.Identifier)) {
                    return;
                }
                
                if(node.name  !== "base" &&
                   node.value !== "base" &&
                   node.name  !== "root" &&
                   node.value !== "root") {
                    return;
                }
                
                parent = this.parents().pop();
                
                replacer(parent);
            }
        });
    },
    
    _setModulesAST : function(ast) {
        var existing, node;
        
        existing = ast.value.properties.some(function(property, idx) {
            if((property.key.type === syntax.Identifier && property.key.name === "modules") ||
               (property.key.type === syntax.Literal    && property.key.value === "modules")) {
                node = idx;
                
                return true;
            }
            
            return false;
        });
        
        if(existing) {
            ast.value.properties[node] = this._modulesAST();
        } else {
            ast.value.properties.push(this._modulesAST());
        }
    }
};

module.exports = Group;
