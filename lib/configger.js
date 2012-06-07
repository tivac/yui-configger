/*global require:true, exports:true */
(function() {
    
    var argv = require("optimist")
                .usage("Generate a YUI config.\nUsage: $0 -r [dir] -f [filter] -t [file] -o [file]")
                .demand([ "r", "o" ])
                .alias("r", "root")
                .alias("t", "tmpl")
                .alias("o", "output")
                .alias("f", "filter")
                .describe("r", "Root directory to read YUI modules from")
                .describe("f", "File-name filter")
                .describe("t", "YUI config template file to use")
                .describe("o", "Output file for generated config")
                .argv,
                
        wrench    = require("wrench"),
        util      = require("util"),
        path      = require("path"),
        fs        = require("fs"),
        esprima   = require("esprima"),
        escodegen = require("escodegen"),
        jsRegex   = /\.js$/,
        filter    = argv.f ? new RegExp(argv.f) : /./;
    
    exports.run = function() {
        var files;
        
        //find files on disk, filter to just .js files
        files = wrench.readdirSyncRecursive(argv.r);
        files = files.filter(function(file) {
            var stat = fs.statSync(path.join(argv.r, file));
            
            if(!stat.isDirectory() && stat.isFile() && jsRegex.test(file) && filter.test(file)) {
                return true;
            }
        });
        
        //read files off disk
        files = files.map(function(file) {
            var out = {
                    path : {
                        full : null,
                        relative : file
                    },
                    contents : null
                },
                contents;
                
            out.path.full = path.join(argv.r, file);
            
            contents = fs.readFileSync(out.path.full, "utf-8");
            
            if(!contents) {
                return;
            }
            
            out.contents = contents;
            
            return out;
        });
        
        files.forEach(function(file) {
            var ast = esprima.parse(file.contents),
                body = ast.body,
                args = ast.body[0] && ast.body[0].expression && ast.body[0].expression.arguments,
                module,
                meta;
            
            //validate that this is a bare YUI module
            if(ast.type !== "Program" ||
               body[0].type !== "ExpressionStatement" ||
               !args ||
               args[0].type !== "Literal" ||
               args.length < 4 ||
               args[3].type !== "ObjectExpression") {
                return;
            }
            
            module = args[0].value;
            meta = args[3];
            
            console.log("FILE: ", file.path.relative); //TODO: REMOVE DEBUGGING
            console.log("MODULE: ", module);
            console.log("META: "); //TODO: REMOVE DEBUGGING
            console.log(escodegen.generate(meta)); //TODO: REMOVE DEBUGGING
        });
        
        //adjust object to work as YUI module definition
        //generate YUI modules section & save to output file
    };
}());
