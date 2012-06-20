/*global require, module, exports, process */
var wrench    = require("wrench"),
    util      = require("util"),
    path      = require("path"),
    fs        = require("fs"),
    esprima   = require("esprima"),
    escodegen = require("escodegen"),
    traverse  = require("traverse");

module.exports = Configger;

function Configger(config) {
    this.root   = config.root;
    this.tmpl   = config.tmpl;
    this.output = config.output;
    this.key    = config.key;
    this.filter = new RegExp(config.filter);
    this.extRegex = /\.js$/;
}

// Array.prototype.filter callback bound to instance context in findFiles
Configger.prototype._filterFile = function(file) {
    var stat = fs.statSync(path.join(this.root, file));
    return !stat.isDirectory() &&
            stat.isFile() &&
            this.extRegex.test(file) &&
            this.filter.test(file);
};

// find .js files that match (optional) filter
Configger.prototype.findFilePaths = function() {
    var files = wrench.readdirSyncRecursive(this.root);

    this._filePaths = files.filter(this._filterFile, this);
};

// Array.prototype.map callback bound to instance context in readFiles
Configger.prototype._readFile = function(file) {
    var contents,
        out = {
            path: {
                full: path.join(this.root, file),
                relative: file
            },
            contents: null
        };

    contents = fs.readFileSync(out.path.full, "utf-8");

    if(contents) {
        out.contents = contents;
        return out;
    }
};

Configger.prototype.readFileContents = function() {
    this._fileContents = this._filePaths.map(this._readFile, this);
};

Configger.prototype._validateModule = function(src) {
    return src.get([ "type" ])  === "Program" &&
        src.get([ "body", "0", "type" ]) === "ExpressionStatement" &&
        src.get([ "body", "0", "expression", "type" ]) === "CallExpression" &&
        src.get([ "body", "0", "expression", "callee", "object", "name" ]) === "YUI" &&
        src.get([ "body", "0", "expression", "callee", "property", "name" ]) === "add";
};

Configger.prototype._addGroupModuleMetadata = function(group, module, meta) {
    var groups = this._groups;

    if(!groups.hasOwnProperty(group)) {
        groups[group] = {
            // manually creating partial AST syntax here
            ast: {
                type: "ObjectExpression",
                properties: []
            },
            length: 0
        };
    }

    groups[group].ast.properties.push({
        type: "Property",
        key: {
            type: "Literal",
            value: module
        },
        value: meta,
        kind: "init"
    });
};

Configger.prototype._parseModule = function(file) {
    var group = path.dirname(file.path.relative),

        ast = esprima.parse(file.contents),
        src = traverse(ast),

        // validate that this is a bare YUI module
        valid = this._validateModule(src),

        args = src.get([ "body", "0", "expression", "arguments" ]),
        module, meta;

    if(group === ".") {
        group = "root";
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

    this._addGroupModuleMetadata(group, module, meta);
};

// store generated code length alongside AST
Configger.prototype._storeGeneratedLengths = function() {
    var groups = this._groups,
        group;

    for(group in groups) {
        if(groups.hasOwnProperty(group)) {
            groups[group].length = escodegen.generate(groups[group].ast).length;
        }
    }
};

// parse files & create module info
Configger.prototype.parseModuleInfo = function() {
    this._groups = this._groups || {};

    this._fileContents.forEach(this._parseModule, this);

    this._storeGeneratedLengths();

    return this._groups;
};

Configger.prototype.parseTemplateConfig = function() {
    var configFileName = path.join(this.root, this.tmpl),
        stat, src;

    stat = fs.statSync(configFileName);

    if(!stat.isFile()) {
        console.error("Invalid config file or unable to find valid config file");
        process.exit(1);
    }

    src = fs.readFileSync(configFileName, "utf-8");

    // need comment & range info to properly re-inject comments later... maybe
    this._templateConfig = esprima.parse(src, {
        comment : true,
        range : true
    });

    return this._templateConfig;
};

Configger.prototype.run = function() {
    var info,
        config,
        src;

    // find file names
    this.findFilePaths();

    // read file contents
    this.readFileContents();

    // parse into ASTs & determine structure
    info = this.parseModuleInfo();

    // find config file, read & parse it
    config = this.parseTemplateConfig();

    traverse(config.body).forEach(function(node) {
        var group, name;

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

    if(this.output) {
        console.log('TODO: Writing output to ' + this.output);
    } else {
        console.log(src); //TODO: REMOVE DEBUGGING
    }
};
