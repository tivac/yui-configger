/*global require:true, exports:true, process:true */
var argv = require("optimist")
            .usage("Generate a YUI config.\nUsage: $0 -r [dir] -f [filter] -t [file] -o [file]")
            .options(require("../config.js"))
            .argv,

    wrench    = require("wrench"),
    util      = require("util"),
    path      = require("path"),
    fs        = require("fs"),
    esprima   = require("esprima"),
    escodegen = require("escodegen"),
    traverse  = require("traverse"),
    jsRegex   = /\.js$/,
    filter    = new RegExp(argv.filter),

    findFiles, readFiles, parseModules, readConfig;

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

        out.path.full = path.join(argv.root, file);

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
        group;

    //parse files & create module info
    files.forEach(function(file) {
        var group = path.dirname(file.path.relative),
            ast = esprima.parse(file.contents),
            src = traverse(ast),
            args = src.get([ "body", "0", "expression", "arguments" ]),
            valid = false,
            module, meta;

        (group === ".") && (group = "root");

        //validate that this is a bare YUI module
        if(src.get([ "type" ])  === "Program" &&
           src.get([ "body", "0", "type" ]) === "ExpressionStatement" &&
           src.get([ "body", "0", "expression", "type" ]) === "CallExpression" &&
           src.get([ "body", "0", "expression", "callee", "object", "name" ]) === "YUI" &&
           src.get([ "body", "0", "expression", "callee", "property", "name" ]) === "add") {
            valid = true;
        }

        if(!valid) {
            console.error(file.path.relative + " invalid YUI module");

            return;
        }

        module = args[0].value;
        meta = args[3] || {
            type : "ObjectExpression",
            properties : []
        };

        //make sure meta's an object
        if(meta.type !== "ObjectExpression") {
            console.error("Unable to create module meta object");

            return;
        }

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

        if(!(group in groups)) {
            groups[group] = {
                //manually creating partial AST syntax here
                ast : {
                    type : "ObjectExpression",
                    properties : []
                },
                length : 0
            };
        }

        groups[group].ast.properties.push({
            type : "Property",
            key : {
                type : "Literal",
                value : module
            },
            value : meta,
            kind : "init"
        });
    });

    //store generated code length alongside AST
    for(group in groups) {
        groups[group].length = escodegen.generate(groups[group].ast).length;
    }

    return groups;
};

readConfig = function(config) {
    var stat, src, ast;

    stat = fs.statSync(config);

    if(!stat.isFile()) {
        console.error("Invalid config file or unable to find valid config file");
        process.exit(1);
    }

    src = fs.readFileSync(config, "utf-8");

    //need comment & range info to properly re-inject comments later... maybe
    return esprima.parse(src, {
        comment : true,
        range : true
    });
};

exports.run = function() {
    var dir = argv.root,
        files, info, src;

    //find file names
    files = findFiles(dir, filter);

    //read file contents
    files = readFiles(files);

    //parse into ASTs & determine structure
    info = parseModules(files);

    //find config file, read & parse it
    config = readConfig(path.join(argv.root, argv.tmpl));

    traverse(config.body).forEach(function(node) {
        var group, name, parent;

        //TODO: Ensure that the key is also "modules" (just in case)
        if(this.key === "value" && node.type === "Literal" && node.value === "configger") {
            group = this.parents[this.parents.length - 4];
            name = traverse(group.node).get([ "key", "name" ]);

            if(name in info) {
                //update this node & don't traverse the new value
                this.update(info[name].ast, true);

                //shuffle comment positioning based on the size of the new AST we insert
                config.comments = config.comments.map(function(comment) {
                    var range = comment.range;

                    if(range[0] > node.range[1]) {
                        range[0] += info[name].length;
                        range[1] += info[name].length;
                    }

                    return comment;
                });
            }
        }
    });

    src = escodegen.generate(config);

    console.log(src); //TODO: REMOVE DEBUGGING
};
