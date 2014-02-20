/*jshint node:true */

"use strict";

var fs      = require("fs"),
    globule = require("globule");

module.exports = {
    find : function(dirs, pattern) {
        var config;
        
        if(!Array.isArray(dirs)) {
            dirs = [ dirs ];
        }
        
        dirs.some(function(dir) {
            var found = globule.find(pattern, {
                    cwd        : dir,
                    prefixBase : true
                });
            
            if(found.length) {
                config = found[0];
            }
            
            return config;
        });
        
        if(!config) {
            return;
        }
        
        return fs.readFileSync(config, "utf-8");
    },
};
