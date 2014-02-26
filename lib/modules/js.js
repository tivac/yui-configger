/*jshint node:true */

"use strict";

var util = require("util"),

    _    = require("lodash"),

    Base = require("./base"),

    JSModule;

// Expects a file path & a file type
JSModule = module.exports = function JSModule(args) {
    Base.call(this, args);
};

JSModule.prototype = Object.create(Base.prototype);

_.extend(JSModule.prototype, {

JSModule.prototype = {
    // Public API
    valid : function() {
        return true;
    }
};
