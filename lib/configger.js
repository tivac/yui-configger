/*global require:true, exports:true, process:true */
(function() {
    
    var argv = require("optimist")
                .usage("Generate a YUI config.\nUsage: $0 -r [dir] -f [filter] -t [file] -o [file]")
                .demand([ "r" ])
                .alias("r", "root")
                .alias("t", "tmpl")
                .alias("o", "output")
                .alias("f", "filter")
                .describe("r", "Root directory to read YUI modules from")
                .describe("f", "File-name filter")
                .describe("t", "YUI config template file to use, will use _config.js in Root if not specified")
                .describe("o", "Output file for generated config")
                .argv,
                
        wrench    = require("wrench"),
        util      = require("util"),
        path      = require("path"),
        fs        = require("fs"),
        esprima   = require("esprima"),
        escodegen = require("escodegen"),
        jsRegex   = /\.js$/,
        filter    = argv.f ? new RegExp(argv.f) : /./,
        
        filterFiles, readFiles, parseModules;
    
    //find .js files that match (optional) filter
    findFiles = function(dir) {
        var files = wrench.readdirSyncRecursive(dir);
        
        return files.filter(function(file) {
            var stat = fs.statSync(path.join(dir, file));
            
            if(!stat.isDirectory() && stat.isFile() && jsRegex.test(file) && filter.test(file)) {
                return true;
            }
        });
    };
    
    readFiles = function(files) {
        return files.map(function(file) {
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
    };
    
    parseModules = function(files) {
        var groups = {},
            modules = [];
        
        //parse files & create module info
        files.forEach(function(file) {
            var group = path.dirname(file.path.relative),
                ast = esprima.parse(file.contents),
                body = ast.body,
                args = ast.body[0] && ast.body[0].expression && ast.body[0].expression.arguments,
                valid = false,
                module, meta;
            
            (group === ".") && (group = "root");
            
            //validate that this is a bare YUI module
            if(ast.type === "Program" &&
               body[0].type === "ExpressionStatement" &&
               body[0].expression.type === "CallExpression" &&
               body[0].expression.callee.object.name === "YUI" &&
               body[0].expression.callee.property.name === "add") {
                valid = true;
            }
            
            if(!valid) {
                return;
            }
            
            module = args[0].value;
            meta = args[3] || esprima.parse("{}");
            
            //make sure meta's an object
            if(meta.type !== "ObjectExpression") {
                return;
            }
            
            //TODO: would it be more efficient to create an object, parse
            //it's JSON form into an AST, & yank out the bits we need?
            //Worth investigating I suppose
            meta.properties.unshift({
                type : "Property",
                key : {
                    type : "Identifier",
                    name : "path"
                },
                value : {
                    type : "Literal",
                    value : path.basename(file.path.full)
                }
            });
            
            modules.push({
                group  : group,
                module : module,
                config : meta
            });
            
            groups[group] || (groups[group] = {});
            groups[group][module] = true;
        });

        return {
            groups : groups,
            modules : modules
        };
    };
    
    exports.run = function() {
        var dir = argv.r,
            files, info;
        
        //find file names
        files = findFiles(dir, filter);
        
        //read file contents
        files = readFiles(files);
        
        //parse into ASTs & determine structure
        info = parseModules(files);
        
        console.log(JSON.stringify(info.groups, null, 4)); //TODO: REMOVE DEBUGGING
        console.log(info.modules); //TODO: REMOVE DEBUGGING
        
        //TODO: read & parse config
        //TODO: determine where to store module info
    };
}());
