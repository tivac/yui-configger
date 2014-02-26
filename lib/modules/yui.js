/*jshint node:true */
"use strict";

var _          = require("lodash"),
    esprima    = require("esprima"),
    estraverse = require("estraverse"),
    esquery    = require("esquery"),
    
    Base       = require("./base"),
    
    syntax     = estraverse.Syntax,
    YUIModule;

// Expects a file path & a file type
YUIModule = module.exports = function YUIModule() {
    Base.apply(this, Array.prototype.slice.apply(arguments));

    this._config = this._buildConfig();
};

YUIModule.prototype = Object.create(Base.prototype);

_.extend(YUIModule.prototype, {
    // Public API
    valid : function() {
        // JS modules w/ unparse-able ASTs aren't valid
        if(!this._ast) {
            return false;
        }

        // TODO: only checks for YUI.add, doesn't validate name or function
        // TODO: as long as it has an AST, it's valid. If it's a valid YUI module change type to "yui".
        return !!esquery(this._ast, "[object.name='YUI'][property.name='add']").length;
    },

    // Private API
    _buildConfig : function() {
        var ast, name, config;
        
        ast = this._ast = esprima.parse(this._src);

        // validate that this is a bare YUI module
        if(!this.valid()) {
            return;
        }

        ast = esquery(ast, "[arguments]")[0];

        // determine module name
        if(!ast.arguments[0].type ||
            ast.arguments[0].type !== syntax.Literal ||
            typeof ast.arguments[0].value !== "string") {
            
            throw new Error(this._file + " has no name specified");
        } else {
            name = ast.arguments[0].value;
        }

        // Override specified name w/ YUI.add-derived name
        // since it's what Loader will use anyways
        this._name = name;
        
        // get module config, or create a blank one
        if(ast.arguments.length < 4) {
            config = _.cloneDeep(this._baseConfig);
        } else {
            config = ast.arguments[3];
        }
        
        config = this._addPath(config);

        return config;
    }
});
