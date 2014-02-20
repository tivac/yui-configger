/*jshint node:true */
"use strict";

var path       = require("path"),
    
    esprima    = require("esprima"),
    escodegen  = require("escodegen"),
    estraverse = require("estraverse"),
    esquery    = require("esquery"),
    shell      = require("shelljs"),
    log        = require("npmlog"),
    
    Module         = require("./module.js"),
    Group          = require("./group.js"),
    pathToUri      = require("./path-to-uri.js"),
    groupTemplate  = require("./group-template"),
    configTemplate = require("./config-template"),
    args           = require("./args"),
    
    syntax = estraverse.Syntax;

log.heading = "configger";

function Configger(config) {
    var dirs, options;
    
    this.options = options = args(config || {});
    
    // Support loglevel shorthands
    if(options.verbose) {
        options.loglevel = "verbose";
    }

    if(options.silent) {
        options.loglevel = "silent";
    }

    log.level = options.loglevel;
    
    // Normalize root
    this.options.root = path.normalize(options.root);

    // Fall back to using root dir if no search dirs are specified
    dirs = options.dirs || (config._ && config._.length ? config._ : null) || [ options.root ];
    
    // Make sure search dirs are normalized
    this.options.dirs = dirs.map(function(dir) {
        return path.normalize(dir);
    });

    // Compile into a RegExp
    this.options.filter = new RegExp(options.filter);

    // File extensions to match against, make sure they all have a leading "."
    this.options.exts = this.options.extensions
        .split(",")
        .map(function(ext) {
            ext = ext.trim();

            return (ext.indexOf(".") === 0 ? "" : ".") + ext;
        });
    
    // Provide a default module name filter
    this.options.nameFn = options.nameFn || this._nameFn;
}

Configger.prototype = {
    // Default naming function for modules
    _nameFn : function(file, type) {
        // For now non-css modules are just ignored &
        // the Module class will take care of it
        if(type !== "css") {
            return;
        }

        return "css-" + path.basename(file, path.extname(file));
    },
    
    // Search file system for files that look like modules & attempt to create
    // Module instances from them
    _modules : function() {
        var self    = this,
            options = this.options,
            modules;
        
        modules = shell.find(this.options.dirs)
            .filter(function(file) {
                // Doesn't check extension, that happens in the .map
                return  shell.test("-f", file) &&
                        path.basename(file) !== options.tmpl &&
                        self.options.filter.test(file);
            })
            .map(function(file) {
                var type;

                file = path.normalize(file);

                self.options.exts.some(function(ext) {
                    if(path.extname(file) !== ext) {
                        return;
                    }

                    type = ext.substring(1);

                    return type;
                });

                // Couldn't find extension matching file type, or CSS modules
                // are disabled for this run
                if(!type || (type === "css" && !self.options.css)) {
                    return;
                }

                return new Module({
                    file : file,
                    type : type,
                    name : options.nameFn.call(this, file, type)
                });
            })
            .filter(function(module) {
                return module && module.valid;
            });
        
        return modules;
    },

    // Create Group instances based on modules that have been found
    _groups : function(modules) {
        var options = this.options,
            groups  = {};
        
        modules.forEach(function(module) {
            var relative = path.relative(options.root, path.dirname(module.file)),
                name     = pathToUri(relative);
            
            if(name in groups) {
                return;
            }

            groups[name] = new Group({
                name   : name,
                dir    : relative,
                prefix : options.prefix
            });
        });
        
        return groups;
    },
    
    _insertGroups : function(ast, groups) {
        var root     = esquery(ast, "Property[key.name='groups']"),
            existing = {},
            insert   = [],
            group;
        
        if(!root.length) {
            throw new Error("Unable to find \"groups\" root");
        }

        root = root[0];

        root.value.properties.forEach(function(item) {
            existing[item.key.value] = item;
        });
        
        for(group in groups) {
            if(group in existing) {
                // add existing template to group
                groups[group].existing = existing[group];
                
                // replace template with newly-generated value
                existing[group] = groups[group].ast;
            } else {
                insert.push(groups[group].ast);
            }
        }

        // shove new group onto the beginning
        Array.prototype.push.apply(root.value.properties, insert);
        
        return ast;
    },

    run : function() {
        var options = this.options,
            modules = this._modules(),
            groups  = this._groups(modules),
            config  = configTemplate.find(options.dirs, options.tmpl),
            group, tmpl;
        
        if(!config) {
            log.error("run", "Couldn't find config template: %s", options.tmpl);
            
            return;
        }
        
        config = esprima.parse(config, {
            comment : true,
            range   : true,
            tokens  : true
        });
        
        tmpl = groupTemplate.find(config);
        
        if(!tmpl) {
            log.info("run", "No group template found in config file, generating from scratch");
        } else {
            for(group in groups) {
                groups[group].template = tmpl;
            }
        }
        
        // assign modules to correct groups
        modules.forEach(function(module) {
            var group = path.relative(options.root, path.dirname(module.file));
            
            group = pathToUri(group);
            
            groups[group].modules.push(module);
        });
        
        config = this._insertGroups(config, groups);
        
        return escodegen.generate(config, {
            format : {
                quotes  : "double",
                newline : require("os").EOL
            }
        });
    }
};

module.exports = Configger;
