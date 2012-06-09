/*global require:true, exports:true */
(function() {
    var path    = require("path"),
        fs      = require("fs"),
        wrench  = require("wrench"),
        jsRegex = /\.js$/;
    
    exports.filter = function(dir, filter) {
        
        //find .js files that match (optional) filter
        var files = wrench.readdirSyncRecursive(dir);
        
        files = files.filter(function(file) {
            var stat = fs.statSync(path.join(dir, file));
            
            if(!stat.isDirectory() && stat.isFile() && jsRegex.test(file) && filter.test(file)) {
                return true;
            }
        });
        
        return files;
    };
    
}());
