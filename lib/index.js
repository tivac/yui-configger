/*jshint node:true */
"use strict";

var path       = require("path"),
    fs         = require("fs"),
    esprima    = require("esprima"),
    escodegen  = require("escodegen"),
    estraverse = require("estraverse"),
    flatten    = require("flatten"),
    
    Module     = require("./module.js"),
    Group      = require("./group.js"),
    lib        = require("./lib.js"),
    
    syntax = estraverse.Syntax;

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
    
    if(!config.cli) {
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
    }
    
    this.options = options;
    
    // These need special treatment
    this.options.filter    = new RegExp(options.filter);
    this.options.extension = new RegExp(options.extension);
}

Configger._parse = function(source) {
    return esprima.parse(source, {
        /*comment : true,
        loc     : true,
        range   : true*/
    });
};

Configger.prototype = {
    
    _console : function() {
        var args   = Array.prototype.slice.apply(arguments),
            method = args.shift();
        
        if(!this.options.quiet && (method in console)) {
            console[method].apply(null, args);
        }
    },
    
    _dirs : function(root) {
        var self    = this,
            dirs    = [];
        
        root || (root = this.options.root);
        
        dirs = dirs.concat(fs.readdirSync(root).filter(
            function(item) {
                var stat = fs.statSync(path.join(root, item));
                
                return stat.isDirectory();
            })
        );
        
        dirs = dirs.map(function(dir) {
            var full = path.join(root, dir);
            
            return [ path.relative(self.options.root, full) ].concat(self._dirs(full));
        });
        
        return dirs;
    },
    
    _groups : function() {
        var options = this.options,
            groups  = {},
            dirs;
        
        dirs = this._dirs();
        
        flatten(dirs).map(function(dir) {
            var name = lib.pathFixup(dir);
            
            groups[name] = new Group({
                name   : name,
                dir    : dir,
                prefix : options.prefix
            });
        });
        
        return groups;
    },
    
    _modules : function() {
        var wrench = require("wrench"),
            options = this.options,
            files;
        
        files = wrench.readdirSyncRecursive(options.root);
        
        files = files.filter(function(file) {
            var stat = fs.statSync(path.join(options.root, file));
            
            return !stat.isDirectory() &&
                    stat.isFile() &&
                    path.basename(file) !== options.tmpl &&
                    options.extension.test(path.extname(file)) &&
                    options.filter.test(file);
        });
        
        return files.map(function(file) {
            return new Module({
                file : path.join(options.root, file),
                root : options.root
            });
        });
    },
    
    _config : function() {
        var options = this.options,
            files   = fs.readdirSync(options.root),
            source;
        
        files = files.filter(function(file) {
            var stat = fs.statSync(path.join(options.root, file));
            
            return !stat.isDirectory() &&
                    stat.isFile() &&
                    path.basename(file) === options.tmpl;
        });
        
        if(!files.length) {
            return;
        }
        
        source = fs.readFileSync(path.join(options.root, files[0]), "utf-8");
        
        return Configger._parse(source);
    },
    
    _template : function(ast) {
        var template;
        
        // find the groups template in the ast
        estraverse.traverse(ast, {
            enter : function enter(node) {
                var parent;
                
                if(!node.key || node.type !== syntax.Property) {
                    return;
                }
                
                if(node.key.value !== "$group" && node.key.name !== "$group") {
                    return;
                }
                
                template = node;
                
                // now go delete this node from the AST
                parent = this.parents().pop();
                parent.properties = parent.properties.filter(function(property) {
                    return property !== node;
                });
                
                this["break"]();
            }
        });
        
        return template;
    },
    
    _insertGroups : function(ast, groups) {
        var group, groupsRoot;
        
        estraverse.traverse(ast, {
            enter : function enter(node) {
                if(node.type !== syntax.Literal && node.type !== syntax.Identifier) {
                    return;
                }
                
                if(node.name !== "groups" && node.value !== "groups") {
                    return;
                }
                
                groupsRoot = this.parents().pop();
                
                this["break"]();
            }
        });
        
        for(group in groups) {
            groupsRoot.value.properties.push(groups[group].ast);
        }
        
        return ast;
    },

    /**
     * The whole enchilada. This is what you call after
     * instantiation to get the goods.
     *
     * @method run
     * @return {String} the generated config code
     */
    run : function() {
        var options = this.options,
            modules = this._modules(),
            groups  = this._groups(),
            config  = this._config(),
            template;
        
        if(!config) {
            this._console("error", "No config file found");
            
            return;
        }
        
        template = this._template(config);
        
        if(!template) {
            this._console("log", "No group template found in config file, generating from scratch");
        }
        
        // assign modules to correct groups
        modules.forEach(function(module) {
            var dir = path.relative(options.root, path.dirname(module.file));
            
            dir = lib.pathFixup(dir);
            
            if(!groups[dir]) {
                return;
            }
            
            groups[dir].modules.push(module);
        });
        
        
        config = this._insertGroups(config, groups);
        
        //console.log(JSON.stringify(config, null, 4));
        return escodegen.generate(config, {
            format : {
                quotes : "double"
            }
        });
    }
};

module.exports = Configger;
