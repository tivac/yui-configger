/*jshint node:true */

"use strict";

var _ = require("lodash");

// Allow for using an optimist config to check an object
// and provide defaults & such
module.exports = function(config) {
    var args = require("../args.json"),
        option;

    // Assume that optimist already validated things
    if(config.$0) {
        return config;
    }
    
    // Check to ensure that all "demand" arguments exist
    for(option in args) {
        if(!(option in config) && args[option].demand) {
            throw new Error("Missing required config value: " + option);
        }
    }

    // Mash up user-provided config with an object being generated from
    // args.json that contains the default values
    return _.defaults(
        config,
        _.transform(args, function(result, value, key) {
            if("default" in value) {
                result[key] = value["default"];
            }
        }, {})
    );
};
