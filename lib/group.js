/*jshint node:true */

"use strict";

var Group;

Group = function(name) {
    this._name = name;
    this._modules = [];
};

Group.prototype = {
    get name() {
        return this._name;
    },
    
    get modules() {
        return this._modules;
    },
    
    toAST : function() {
        if(!this._modules.length) {
            return;
        }
        
        return {
            type : "ObjectExpression",
            properties : this._modules.map(function(module) {
                return {
                    type : "Property",
                    key  : {
                        type  : "Literal",
                        value : module.ast
                    },
                    value : module.meta,
                    kind  : "init"
                };
            })
        };
    }
};

module.exports = Group;
