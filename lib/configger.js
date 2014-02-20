/*jshint node:true */
"use strict";

var path       = require("path"),
    fs         = require("fs"),
    
    _          = require("lodash"),
    esprima    = require("esprima"),
    escodegen  = require("escodegen"),
    estraverse = require("estraverse"),
    shell      = require("shelljs"),
    log        = require("npmlog"),
    
    Module     = require("./module.js"),
    Group      = require("./group.js"),
    pathToUri  = require("./path-to-uri.js"),
    template   = require("./template"),
    args       = require("./args"),
    
    syntax = estraverse.Syntax;

log.heading = "configger";

function Configger(config) {
    var dirs, options;
    
    options = args(config || {});
    
    // Support loglevel shorthands
    if(options.verbose) {
        options.loglevel = "verbose";
    }

    if(options.silent) {
        options.loglevel = "silent";
    }

    log.level = options.loglevel;
    
    this.options = options;
    
    // Normalize root
    this.options.root = path.normalize(options.root);

    // Fall back to using root dir if no search dirs are specified
    dirs = options.dirs || config._ || [ options.root ];
    
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
}

Configger._parse = function(source) {
    return esprima.parse(source, {
        comment : true,
        range   : true,
        tokens  : true
    });
};

Configger.prototype = {
    // Search file system for files that look like modules & attempt to create
    // Module instances from them
    _modules : function() {
        var self    = this,
            options = this.options,
            modules;
        
        modules = shell.find(this.options.dirs)
            .filter(function(file) {
                // Doesn't check extension, that happens in the .map
                return  fs.statSync(file).isFile() &&
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
                    file   : file,
                    type   : type,
                    prefix : type === "css" ? self.options.cssprefix : ""
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
    
    _config : function() {
        var options = this.options,
            config  = shell.find(this.options.dirs),
            source;
        
        config = config.filter(function(file) {
            return file.indexOf(options.tmpl) > -1;
        });

        if(!config.length) {
            return;
        }
        
        source = fs.readFileSync(config[0], "utf-8");
        
        return Configger._parse(source);
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

    run : function() {
        var options = this.options,
            modules = this._modules(),
            groups  = this._groups(modules),
            ast     = this._config(),
            group, tmpl;
        
        if(!ast) {
            log.error("run", "Couldn't find config template: %s", options.tmpl);
            
            return;
        }
        
        tmpl = template.find(ast);
        
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
        
        ast = this._insertGroups(ast, groups);
        
        return escodegen.generate(ast, {
            format : {
                quotes  : "double",
                newline : require("os").EOL
            }
        });
    }
};

module.exports = Configger;
