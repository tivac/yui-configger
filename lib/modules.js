/*jshint node:true */

"use strict";

var fs     = require("fs"),
    path   = require("path"),
    
    Module = require("./module.js");

module.exports = {
    find : function(options) {
        var wrench = require("wrench"),
            files;
        
        if(!options.root) {
            return [];
        }
        
        files = wrench.readdirSyncRecursive(options.root);

        files = files.filter(function(file) {
            var stat = fs.statSync(path.join(options.root, file));

            return !stat.isDirectory() &&
                    stat.isFile() &&
                    options.extRegex.test(file) &&
                    options.filter.test(file);
        });
        
        return files.map(function(file) {
            return new Module({ file : file, root : options.root });
        });
    }
};
