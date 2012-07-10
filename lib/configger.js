/*jshint node:true */
"use strict";

var util      = require("util"),
    path      = require("path"),
    fs        = require("fs"),
    esprima   = require("esprima"),
    escodegen = require("escodegen"),
    traverse  = require("traverse"),
    wrench    = require("wrench");

/**
 * @module yui-configger
 * @requires escodegen, esprima, traverse, wrench
 */

/**
 * Configger class provides the functionality of the CLI executable.
 * It is passed a config block when instantiated, and then the
 * instance's `run()` method is called.
 *
 * @class Configger
 * @constructor
 * @param {Object} config
 *      @param {String} config.root
 *          Root directory to read YUI modules from.
 *      @param {String} [config.tmpl=_config-template.js]
 *          YUI config file to use as template.
 *      @param {String} [config.filter=.]
 *          File-name filter (string pattern converted via `new RegExp()`)
 *      @param {String} [config.output=stdout]
 *          Output file for generated config. (used by CLI only)
 *      @param {String} [config.key=configger]
 *          Key in config to replace with module metadata.
 *      @param {Boolean} [config.comments=true]
 *          Keep comments in generated config file.
 */
function Configger(config) {
    this.options = config;

    this.options.filter = new RegExp(config.filter);
    this.options.extRegex = /\.js$/;
    this.options.comments = (config.comments !== "false");
}

Configger.prototype = {

    /**
     * Filter callback bound to instance context in findFilePaths,
     * ensuring each file found is not a directory and matches
     * prescribed filters.
     *
     * @method _filterFile
     * @private
     * @param {String} file  relative path to file
     * @return {Boolean}
     */
    _filterFile : function(file) {
        var stat = fs.statSync(path.join(this.options.root, file));
        return !stat.isDirectory() &&
                stat.isFile() &&
                this.options.extRegex.test(file) &&
                this.options.filter.test(file);
    },

    /**
     * Find .js files that match (optional) filter and populate
     * internal _filePaths property with resulting array.
     *
     * @method findFilePaths
     * @protected
     */
    findFilePaths : function() {
        var files = wrench.readdirSyncRecursive(this.options.root);

        this._filePaths = files.filter(this._filterFile, this);
    },

    /**
     * map callback bound to instance context in readFileContents,
     * reading contents of filtered files into the returned object.
     *
     * @method _readFile
     * @private
     * @param {String} file  relative path to file
     * @return {Object|undefined} If file read fails, it returns undefined.
     */
    _readFile : function(file) {
        var contents,
            out = {
                path: {
                    full: path.join(this.options.root, file),
                    relative: file
                },
                contents: null
            };

        contents = fs.readFileSync(out.path.full, "utf-8");

        if(contents) {
            out.contents = contents;
            return out;
        }
    },

    /**
     * Map internal _filePaths array into _fileContents.
     *
     * @method readFileContents
     * @protected
     */
    readFileContents : function() {
        this._fileContents = this._filePaths.map(this._readFile, this);
    },

    /**
     * Validate that traversed AST is valid YUI module,
     * e.g., `YUI.add('foo', function (Y) {...});`
     *
     * @method _validateModule
     * @private
     * @param {Object} src  traversed AST of given module file
     */
    _validateModule : function(src) {
        return  src.get([ "type" ])  === "Program" &&
                src.get([ "body", "0", "type" ]) === "ExpressionStatement" &&
                src.get([ "body", "0", "expression", "type" ]) === "CallExpression" &&
                src.get([ "body", "0", "expression", "callee", "object", "name" ]) === "YUI" &&
                src.get([ "body", "0", "expression", "callee", "property", "name" ]) === "add";
    },

    /**
     * Add module metadata to group AST, called from _parseModule.
     * If the group does not exist in internal _groups object,
     * it is created.
     *
     * @method _addGroupModuleMetadata
     * @private
     * @param {String} group
     * @param {String} module
     * @param {Object} meta
     */
    _addGroupModuleMetadata : function(group, module, meta) {
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
    },

    /**
     * forEach callback used in parseModuleInfo. It validates the
     * initial AST parsed from the given file contents, and augments
     * the AST with our own fancy bits before storing it internally.
     *
     * @method _parseModule
     * @private
     * @param {Object} file  object storing file contents and path metadata
     *      @param {Object} file.path
     *          @param {String} file.path.full
     *          @param {String} file.path.relative
     *      @param {String} file.contents
     */
    _parseModule : function(file) {
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
            if(file.path.relative !== this.options.tmpl) {
                console.error(file.path.relative + " invalid YUI module");
            }

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
    },

    /**
     * Stores generated code length alongside AST, called after
     * file contents are parsed in parseModuleInfo.
     *
     * @method _storeGeneratedLengths
     * @private
     */
    _storeGeneratedLengths : function() {
        var groups = this._groups,
            group;

        for(group in groups) {
            if(groups.hasOwnProperty(group)) {
                groups[group].length = escodegen.generate(groups[group].ast).length;
            }
        }
    },

    /**
     * Parse files & create module info.
     *
     * @method parseModuleInfo
     * @protected
     * @return {Object} reference to internal groups hash, for convenience.
     */
    parseModuleInfo : function() {
        this._groups = this._groups || {};

        this._fileContents.forEach(this._parseModule, this);

        this._storeGeneratedLengths();

        return this._groups;
    },

    /**
     * Parses config template into AST.
     *
     * @method parseTemplateConfig
     * @protected
     * @return {Object} Config template ast & source text
     */
    parseTemplateConfig : function() {
        var configFileName = path.join(this.options.root, this.options.tmpl),
            stat, src, ast;

        stat = fs.statSync(configFileName);

        if(!stat.isFile()) {
            console.error("Invalid config file or unable to find valid config file");
            process.exit(1);
        }

        src = fs.readFileSync(configFileName, "utf-8");

        // need range info to properly inject metadata
        ast = esprima.parse(src, {
            range : true
        });

        return {
            ast : ast,
            src : src
        };
    },

    /**
     * Takes parsed config info & generated module info & crams it all together
     *
     * @method _updateTemplateConfig
     * @protected
     * @return {String} Updated config source with module information
     */
    updateTemplateConfig : function(config, modules) {
        var self = this,
            src = config.src,
            offset = 0;

        traverse(config.ast.body).forEach(function(node) {
            var group, name, before, after, generated, indent;

            //TODO: Configurable replacement value
            if(this.key === "value" &&
               node.type === "Literal" &&
               node.value === self.options.key &&
               traverse(this.parent.node).get([ "key", "name" ]) === "modules") {
                group = this.parents[this.parents.length - 4];
                name = traverse(group.node).get([ "key", "name" ]);

                if(name in modules) {
                    //saving comments requires some string manipulation
                    if(self.comments) {
                        generated = escodegen.generate(modules[name].ast);

                        //update the source
                        before = src.substring(0, node.range[0] + offset);
                        after  = src.substring(node.range[1] + 1 + offset);

                        src = before + generated + after;

                        offset += generated.length - (node.range[1] - node.range[0]);
                    } else {
                        //Otherwise we can just update the AST
                        this.update(modules[name].ast);
                    }
                }
            }
        });

        return this.options.comments ? src : escodegen.generate(config.ast);
    },

    /**
     * The whole enchilada. This is what you call after
     * instantiation to get the goods.
     *
     * @method run
     * @return {String} the generated config code
     */
    run : function() {
        var modules, config, output;

        // find file names
        this.findFilePaths();

        // read file contents
        this.readFileContents();

        // parse into ASTs & determine structure
        modules = this.parseModuleInfo();

        // find config file, read & parse it
        config = this.parseTemplateConfig();

        output = this.updateTemplateConfig(config, modules);

        return output;
    }

};

module.exports = Configger;
