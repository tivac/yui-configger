/*jshint node:true */
"use strict";

var path      = require("path"),
    fs        = require("fs"),
    esprima   = require("esprima"),
    escodegen = require("escodegen"),
    traverse  = require("traverse"),
    estraverse = require("estraverse")
    filters    = require("./filters.js");

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
 *          Source directory to read YUI modules from.
*      @param {Boolean} [config.comments=false]
 *          Keep comments in generated config file.
 *      @param {Boolean} [config.quiet=false]
 *          Minimal output.
 *      @param {String} [config.tmpl=_config-template.js]
 *          YUI config file to use as template.
 *      @param {String} [config.filter=.]
 *          File-name filter (string pattern converted via `new RegExp()`)
 *      @param {String} [config.output=stdout]
 *          Output file for generated config. (used by CLI only)
 *      @param {String} [config.key=configger]
 *          Key in config to replace with module metadata.
 *      @param {String} [config.prefix]
 *          Prefix for group names
 */
function Configger(config) {
    var options  = {},
        defaults = require("../args.json"),
        option;
    
    // do the defaults dance, in case values weren't set
    for(option in defaults) {
        if(!(option in config) && ("default" in defaults[option])) {
            options[option] = defaults[option]["default"];
            
            continue;
        }
        
        if(option in config) {
            options[option] = config[option];
        }
    }
    
    this.options = options;
    
    this.options.filter   = new RegExp(options.filter);
    this.options.extRegex = /\.js$/;
}

Configger.prototype = {
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
        var full = path.join(this.options.root, file),
            src  = fs.readFileSync(full, "utf-8");
            
        if(!src) {
            return;
        }
        
        return {
            path : {
                full     : full,
                relative : file
            },
            contents : src
        };
    },

    /**
     * Map internal _filePaths array into _fileContents.
     *
     * @method readFileContents
     * @protected
     */
    readFileContents : function() {
        this._fileContents =
            this._filePaths
                .map(this._readFile, this)
                .filter(function(file) {
                    return file;
                });
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
                ast : {
                    type : "ObjectExpression",
                    properties : []
                },
                length : 0
            };
        }

        groups[group].ast.properties.push({
            type : "Property",
            key  : {
                type  : "Literal",
                value : module
            },
            value : meta,
            kind  : "init"
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
        var dirs  = path.dirname(file.path.relative),
            ast, src, args, module, meta, group, filePath;

        try {
            ast = esprima.parse(file.contents);
        } catch(e) {
            console.error("Unable to parse: " + file.path.full);
            console.error(JSON.stringify(e, null, 4));

            return;
        }

        src = traverse(ast);

        // validate that this is a bare YUI module
        if(!this._validateModule(src)) {
            if(file.path.relative !== this.options.tmpl && !this.options.quiet) {
                console.log(file.path.relative + " invalid YUI module");
            }

            return;
        }
        
        // Top-level module information
        // 0 - Module Name
        // 1 - Module Body
        // 2 - Version
        // 3 - Module Meta
        args = src.get([ "body", "0", "expression", "arguments" ]);

        module = args[0].value;
        
        // use existing meta or create our own empty object
        meta = args[3] || {
            type       : "ObjectExpression",
            properties : []
        };

        //make sure meta's an object
        if(meta.type !== "ObjectExpression") {
            console.error("Unable to create module meta object");

            return;
        }

        group = dirs;
        filePath  = path.basename(file.path.full);

        dirs = dirs.split(path.sep);

        // rewrite modules in the root folder to the special "/" group
        // standardize group names across platforms
        group = "/" + (group !== "." ? group = group.replace(path.sep, "/") : "");
        
        meta.properties.unshift({
            type : "Property",
            key  : {
                type : "Identifier",
                name : "path"
            },
            value : {
                type  : "Literal",
                value : filePath
            }
        });
        
        this._addGroupModuleMetadata(this.options.prefix + group, module, meta);
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

        this._fileContents.filter(this._filterModule, this).forEach(this._parseModule, this);
        
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
            stat, src, ast, template;

        stat = fs.statSync(configFileName);

        if(!stat.isFile()) {
            console.error("Invalid config file or unable to find valid config file");
            process.exit(1);
        }

        src = fs.readFileSync(configFileName, "utf-8");

        // need range info to properly inject metadata
        ast = esprima.parse(src, {
            range   : true/*,
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
            ast : ast,
            src : src,
            template : template
        };
    },
    
    buildGroupFromTemplate : function(template, group) {
        
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
            offset = 0,
            groups, result;
            
        estraverse.traverse(config.ast, {
            enter : function enter(node) {
                if(node.type !== estraverse.Syntax.Identifier ||
                   node.name !== "groups") {
                    return;
                }
                
                groups = this.parents().pop();
                
                this["break"]();
            }
        });
        
        console.log(groups);
        
        console.log(modules);
        
               /*
                var group, parent, name, before, after, generated;
                
                console.log(node.type, node.name);
                
                

                parent = this.parents().pop();
                
                console.log(parent);
                
                //Ensure that parent is either modules or "modules"
                if(parent.get([ "key", "name" ]) !== "modules" &&
                   parent.get([ "key", "value"]) !== "modules") {
                    return;
                }

                group = traverse(this.parents[this.parents.length - 4].node);

                //group name might be identifier (name) or a literal string (value)
                name = group.get([ "key", "name" ]) || group.get([ "key", "value" ]);

                if(name in modules) {
                    //saving comments requires some string manipulation
                    if(self.options.comments) {
                        generated = escodegen.generate(modules[name].ast);

                        //update the source
                        before = src.substring(0, node.range[0] + offset);
                        after  = src.substring(node.range[1] + 1 + offset);

                        src = before + generated + after;

                        //TODO: unsure why we need to subtract the extra character...
                        offset += generated.length - (node.range[1] - node.range[0]) - 1;
                    } else {
                        //Otherwise we can just update the AST
                        this.update(modules[name].ast);
                    }
                }
            }
        });*/

        if(this.options.comments) {
            result = src;
        } else {
            result = escodegen.generate(config.ast, {
                comment : true,
                format  : {
                    quotes : "double"
                }
            });
        }
        
        return result;
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