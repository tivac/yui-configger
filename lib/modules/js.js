/*jshint node:true */
"use strict";

var path = require("path"),

    _    = require("lodash"),

    Base = require("./base"),

    JSModule;

// Expects a file path & a file type
JSModule = module.exports = function JSModule() {
    Base.apply(this, Array.prototype.slice.apply(arguments));

    this._name   = path.basename(this.file, path.extname(this.file));
    this._config = this._buildConfig();
};

JSModule.prototype = Object.create(Base.prototype);

_.extend(JSModule.prototype, {
    // Private methods
    _buildConfig : function() {
        return this._addPath(
            _.cloneDeep(this._baseConfig)
        );
    }
});
