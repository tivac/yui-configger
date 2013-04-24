/*jshint node:true */
"use strict";

var path       = require("path"),
    fs         = require("fs"),
    esprima    = require("esprima"),
    escodegen  = require("escodegen"),
    estraverse = require("estraverse"),
    
    Module     = require("./module.js"),
    Group      = require("./group.js"),
    
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
    
    // These need special treatment
    this.options.filter    = new RegExp(options.filter);
    this.options.extension = new RegExp(options.extension);
}

Configger.prototype = {
    
    _parse : function(source) {
        return esprima.parse(source, {
            /*comment : true,
            loc     : true,
            range   : true*/
        });
    },
    
    _files : function() {
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
            return "No config template found";
        }
        
        source = fs.readFileSync(path.join(options.root, files[0]), "utf-8");
        
        return this._parse(source);
    },
    
    _template : function(ast) {
        var template;
        
        // find the groups template in the ast
        estraverse.traverse(ast, {
            enter : function enter(node) {
                if(node.type !== syntax.Property) {
                    return;
                }
                
                if(!node.key) {
                    return;
                }
                
                if(node.key.value !== "$group" && node.key.name !== "$group") {
                    return;
                }
                
                template = node;
                
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
        var self     = this,
            modules  = this._files(),
            config   = this._config(),
            groups   = {},
            template;
        
        template = this._template(config);
        
        modules.forEach(function(module) {
            if(!(module.group in groups)) {
                groups[module.group] = new Group({
                    name     : module.group,
                    dir      : path.relative(self.options.root, path.dirname(module.file)),
                    template : template
                });
            }
            
            groups[module.group].modules.push(module);
        });
        
        config = this._insertGroups(config, groups);
        
        //console.log(JSON.stringify(config, null, 4));
        console.log(escodegen.generate(config));
    }
};

module.exports = Configger;
