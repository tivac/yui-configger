/*jshint node:true */

"use strict";

module.exports = {
    parse : function(options) {
        var fs         = require("fs"),
            path       = require("path"),
            esprima    = require("esprima"),
            estraverse = require("estraverse"),
        
            file = path.join(options.root, options.tmpl),
            
            stat, src, ast, template;

        stat = fs.statSync(file);

        if(!stat.isFile()) {
            console.error("Invalid config file or unable to find valid config file");
            process.exit(1);
        }

        src = fs.readFileSync(file, "utf-8");

        // need range info to properly inject metadata
        ast = esprima.parse(src, {
            range : true/*,
            loc     : true,
            comment : true*/
        });
        
        estraverse.traverse(ast, {
            enter : function enter(node) {
                if(node.type !== estraverse.Syntax.Identifier ||
                   node.name !== "__template__") {
                    return;
                }
                
                template = this.current();
                
                this["break"]();
            }
        });
        
        return {
            ast      : ast,
            src      : src,
            template : template
        };
    }
};
