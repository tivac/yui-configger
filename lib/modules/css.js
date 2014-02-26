/*jshint node:true */
"use strict";

var _    = require("lodash"),

    Base = require("./base"),

    CSSModule;

// Expects a file path & a file type
CSSModule = module.exports = function CSSModule() {
    Base.apply(this, Array.prototype.slice.apply(arguments));

    this._config = this._buildConfig();
};

CSSModule.prototype = Object.create(Base.prototype);

_.extend(CSSModule.prototype, {
    // Private methods
    _buildConfig : function() {
        var config = this._addPath(
            _.cloneDeep(this._baseConfig)
        );

        config.properties.push({
            type  : "Property",
            key   : {
                type : "Identifier",
                name : "type"
            },
            value : {
                type  : "Literal",
                value : "css"
            }
        });

        return config;
    }
});
