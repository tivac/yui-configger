/*jshint node:true */
"use strict";

var path       = require("path"),
    
    esprima    = require("esprima"),
    escodegen  = require("escodegen"),
    esquery    = require("esquery"),
    log        = require("npmlog"),
    globule    = require("globule"),
    
    Module         = require("./module.js"),
    Group          = require("./group.js"),
    pathToUri      = require("./path-to-uri.js"),
    groupTemplate  = require("./group-template"),
    configTemplate = require("./config-template"),
    args           = require("./args");

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
    options.root = path.normalize(options.root);

    // Fall back to using root dir if no search dirs are specified
    dirs = options.dirs || (options._ && options._.length ? options._ : null) || [ options.root ];
    
    // Make sure search dirs are normalized
    options.dirs = dirs.map(function(dir) {
        return path.normalize(dir);
    });

    options.extensions = {
        js  : this._buildExtFilters(options.jsextensions),
        css : this._buildExtFilters(options.cssextensions)
    };
    
    // Provide a default module name filter
    options.nameFn = options.nameFn || this._nameFn;
}

Configger.prototype = {
    // Default naming function for modules
    _nameFn : function(file, type) {
        var name = path.basename(file, path.extname(file));

        if(type !== "css") {
            return name;
        }

        return "css-" + name;
    },

    _buildExtFilters : function(exts) {
        return exts
            .split(",")
            .filter(function(ext) {
                return ext.length;
            })
            .map(function(ext) {
                ext = ext.trim();

                return "**/*" + (ext.indexOf(".") === 0 ? "" : ".") + ext;
            });
    },

    // Build an array of glob matchers for finding files on disk
    _buildFilters : function() {
        var options = this.options,
            filters;

        // Turn file extensions into array of globs
        // A bit inefficient, but nicer looking! :D
        filters = []
            .concat(options.extensions.js)
            .concat(options.extensions.css)
            .concat([ "!" + options.tmpl ]);

        if(options.output) {
            filters.push("!" + options.output);
        }

        return filters;
    },
    
    // Search file system for files that look like modules & attempt to create
    // Module instances from them
    _modules : function() {
        var options = this.options,
            modules = [],
            filters = this._buildFilters();

        // Go find all potentially available files
        options.dirs.forEach(function(dir) {
            modules.push.apply(modules,
                globule.find({
                    src        : filters,
                    cwd        : dir,
                    prefixBase : dir
                })
            );
        });

        modules = modules
            .filter(function(file) {
                if(options.filter) {
                    return globule.isMatch(options.filter, file);
                }

                return true;
            })
            .filter(function(file) {
                // All files are cool if CSS is enabled
                if(options.css) {
                    return true;
                }

                // Otherwise filter out CSS modules
                return globule.isMatch(options.extensions.js, file);
            })
            .map(function(file) {
                var type = globule.isMatch(options.extensions.css, file) ? "css" : "js";

                return new Module({
                    file : file,
                    type : type,
                    name : options.nameFn(file, type)
                });
            })
            .filter(function(module) {
                return module.valid();
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
        Array.prototype.unshift.apply(root.value.properties, insert);
        
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
