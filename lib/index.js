/*jshint node:true */
"use strict";

var path       = require("path"),
    fs         = require("fs"),
    
    esprima    = require("esprima"),
    escodegen  = require("escodegen"),
    estraverse = require("estraverse"),
    shell      = require("shelljs"),
    log        = require("npmlog"),
    
    Module     = require("./module.js"),
    Group      = require("./group.js"),
    lib        = require("./lib.js"),
    
    syntax = estraverse.Syntax;

log.heading = "configger";

/**
 * @module yui-configger
 * @requires escodegen, esprima, traverse, shelljs
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
    
    if(config["$0"]) {
        options = config
    } else {
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
    
    log.level = options.verbose ? "verbose" : options.level;
    
    this.options = options;
    
    // These need special treatment
    this.options.filter    = new RegExp(options.filter);
    this.options.extension = new RegExp(options.extension);
}

Configger._parse = function(source) {
    return esprima.parse(source, {
        comment : true,
        range   : true,
        tokens  : true
    });
};

Configger.prototype = {
    _dirs : function(root) {
        var self    = this,
            dirs    = [];
        
        root || (root = this.options.root);
        
        dirs = shell.find(root)
            .filter(function(item) {
                return fs.statSync(item).isDirectory();
            }).map(function(dir) {
                return path.relative(self.options.root, dir);
            });
        
        // make sure root directory is added
        dirs.unshift("");
        
        return dirs;
    },
    
    _groups : function() {
        var options = this.options,
            groups  = {};
        
        this._dirs().forEach(function(dir) {
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
        var options = this.options,
            files, modules;
        
        files = shell.find(options.root)
            .filter(function(file) {
                var stat = fs.statSync(file);
                
                return !stat.isDirectory() &&
                        stat.isFile() &&
                        path.basename(file) !== options.tmpl &&
                        options.extension.test(path.extname(file)) &&
                        options.filter.test(file);
            });
        
        modules = files
            .map(function(file) {
                return new Module({
                    file : file,
                    root : options.root
                });
            })
            .filter(function(module) {
                return module.valid;
            });
        
        return modules
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
        var group, groupsRoot, existing;
        
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
        
        existing = {};
        groupsRoot.value.properties.forEach(function(item) {
            existing[item.key.value] = item;
        });
        
        for(group in groups) {
            if(group in existing) {
                // add existing template to group
                groups[group].existing = existing[group];
                
                // replace template with newly-generated value
                existing[group] = groups[group].ast;
            } else {
                // shove new group onto the end
                groupsRoot.value.properties.push(groups[group].ast);
            }
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
            ast     = this._config(),
            group, template;
        
        if(!ast) {
            log.error(options.tmpl, "No config file found");
            
            return;
        }
        
        template = this._template(ast);
        
        if(!template) {
            log.info("", "No group template found in config file, generating from scratch");
        } else {
            for(group in groups) {
                groups[group].template = template;
            }
        }
        
        // assign modules to correct groups
        modules.forEach(function(module) {
            var dir = path.relative(options.root, path.dirname(module.file));
            
            dir = lib.pathFixup(dir);
            
            groups[dir].modules.push(module);
        });
        
        // remove groups w/ no modules
        for(group in groups) {
            if(groups[group].modules.length) {
                continue;
            }
            
            delete groups[group];
        }
        
        ast = this._insertGroups(ast, groups);
        
        //ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
        return escodegen.generate(ast, {
            format : {
                quotes : "double"
            }
        });
    }
};

module.exports = Configger;
