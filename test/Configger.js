/*jshint node:true */
/*global describe, it */

"use strict";

var path      = require("path"),
    assert    = require("assert"),
    
    Configger = require("../lib/configger"),

    _file     = require("./_file");

describe("yui-configger", function() {
    describe("Configger Class", function() {
        it("should load defaults from args.js", function() {
            var c = new Configger(),
                args = require("../args.js");
            
            assert.equal(c.options.root,      path.normalize("."));
            assert.equal(c.options.dirs[0],   path.normalize("."));
            assert.equal(c.options.tmpl,      args.tmpl.default);
            assert.equal(c.options.prefix,    args.prefix.default);
            assert.equal(c.options.loglevel,  args.loglevel.default);
            assert.deepEqual(
                c.options.extensions,
                {
                    js  : [ "**/*.js" ],
                    css : [ "**/*.css" ]
                }
            );
            assert.equal(c.options.nameFn,   c._nameFn);
        });
        
        it("shouldn't load defaults when the CLI provided them", function() {
            var c = new Configger({
                    "$0"          : true,
                    root          : "./test/specimens/simple/",
                    _             : [ "./test/specimens/simple/" ],
                    jsextensions  : ".jss",
                    cssextensions : "ccs",
                    tmpl          : "_config-tmpl.js",
                    filter        : "fooga.js",
                    prefix        : "wooga",
                    verbose       : false,
                    silent        : false,
                    loglevel      : "verbose"
                });
            
            assert.equal(c.options.root,      path.normalize("./test/specimens/simple/"));
            assert.equal(c.options.dirs[0],   path.normalize("./test/specimens/simple/"));
            assert.equal(c.options.tmpl,      "_config-tmpl.js");
            assert.equal(c.options.filter,    "fooga.js");
            assert.equal(c.options.prefix,    "wooga");
            assert.deepEqual(
                c.options.extensions,
                {
                    js  : [ "**/*.jss" ],
                    css : [ "**/*.ccs" ]
                }
            );
        });

        it("should respect the loglevel shortcuts", function() {
            var verbose = new Configger({ verbose : true }),
                silent  = new Configger({ silent  : true });
            
            assert.equal(verbose.options.loglevel, "verbose");
            assert.equal(silent.options.loglevel,  "silent");
        });

        it("should ensure that all extensions are prefixed with \".\"", function() {
            var c = new Configger({
                    jsextensions  : "jss",
                    cssextensions : "ccs"
                });

            assert.deepEqual(
                c.options.extensions,
                {
                    js  : [ "**/*.jss" ],
                    css : [ "**/*.ccs" ]
                }
            );
        });

        it("should use the root if no search dirs are specified", function() {
            var c = new Configger({
                    root : "./test/specimens/simple/"
                });

            assert.equal(c.options.dirs[0], path.normalize("./test/specimens/simple/"));
        });
        
        it("should find modules on the file system", function() {
            var c = new Configger({
                    root : "./test/specimens/simple/"
                }),
                modules = c._modules();
            
            assert(modules.length);
        });

        it("should find non-default modules on the file system", function() {
            var c = new Configger({
                    root         : "./test/specimens/mixed/",
                    jsextensions : "js, mjs"
                }),
                modules = c._modules();
            
            assert(modules.length);
            assert(modules.some(function(module) {
                return module.file.indexOf(path.join("js/a.js")) > -1;
            }));
            assert(modules.some(function(module) {
                return module.file.indexOf(path.join("templates/a.mjs")) > -1;
            }));
        });

        it("should only find modules matching the filter", function() {
            var c = new Configger({
                    root   : "./test/specimens/mixed/",
                    filter : "**/a.js"
                }),
                modules = c._modules();
            
            assert(modules.length === 1);
            assert(modules[0].file.indexOf(path.join("js/a.js")) > -1);
        });

        it("should exclude the output file from the list of modules", function() {
                var c = new Configger({
                    root   : "./test/specimens/group-template/",
                    output : "a.js"
                }),
                modules = c._modules();
            
            assert(modules.length);
            modules.forEach(function(module) {
                assert(module.file.indexOf(path.join("js/a.js")) === -1);
            });
        });
        
        it("should create groups from directories on the file system", function() {
            var c = new Configger({
                    root : "./test/specimens/simple/"
                }),
                groups = c._groups(c._modules());
            
            assert(groups);
            assert(Object.keys(groups).length);
            assert(groups["/"]);
            assert(groups["/subfolder/"]);
        });
        
        it("should return a config string from run (simple)", function() {
            var c = new Configger({
                    root   : "./test/specimens/simple/",
                    silent : true
                });
            
            assert.equal(
                c.run(),
                _file("./test/specimens/simple/_config.js")
            );
        });
        
        it("should return a config string from run (group-template)", function() {
            var c = new Configger({
                    root   : "./test/specimens/group-template/",
                    silent : true
                });
               
            assert.equal(
                c.run(),
                _file("./test/specimens/group-template/_config.js")
            );
        });
        
        it("should return a config string from run (standard)", function() {
            var c = new Configger({
                    root   : "./test/specimens/standard/",
                    silent : true
                });
           
            assert.equal(
                c.run(),
                _file("./test/specimens/standard/_config.js")
            );
        });

        it("should return a config string from run (mixed)", function() {
            var c = new Configger({
                    root   : "./test/specimens/mixed",
                    dirs   : [ "./test/specimens/mixed/js", "./test/specimens/mixed/css" ],
                    silent : true
                });
           
            assert.equal(
                c.run(),
                _file("./test/specimens/mixed/js/_config.js")
            );
        });

        it("should return a config string containing CSS from run (mixed)", function() {
            var c = new Configger({
                    root   : "./test/specimens/mixed",
                    dirs   : [ "./test/specimens/mixed/js", "./test/specimens/mixed/css" ],
                    silent : true,
                    css    : true
                });
            
            assert.equal(
                c.run(),
                _file("./test/specimens/mixed/js/_config-css.js")
            );
        });

        it("should return a config string containing user-specified extensions from run (mixed)", function() {
            var c = new Configger({
                    root         : "./test/specimens/mixed",
                    silent       : true,
                    jsextensions : "mjs"
                });
            
            assert.equal(
                c.run(),
                _file("./test/specimens/mixed/js/_config-mjs.js")
            );
        });
        
        it("should bail if no ast can be generated", function() {
            var c = new Configger({
                    root   : "./test/specimens/empty/",
                    silent : true
                });
                
            assert.equal(c.run(), undefined);
        });

        it("should bail if the config template doesn't have a groups property", function() {
            var c = new Configger({
                    root   : "./test/specimens/mixed",
                    silent : true
                }),
                ast = require("./specimens/invalid-template.ast.json");

            assert.throws(function() {
                c._insertGroups(ast);
            });
        });

        it("should support a custom nameFn", function() {
            var c = new Configger({
                    root   : "./test/specimens/name-fn/",
                    silent : true,
                    css    : true,
                    nameFn : function(file, type) {
                        return "fooga";
                    }
                });

            assert.equal(
                c.run(),
                _file("./test/specimens/name-fn/_config.js")
            );
        });

        it("should support bare JS modules", function() {
            var c = new Configger({
                    root   : "./test/specimens/bare-js/",
                    silent : true,
                    js     : true
                });

            assert.equal(
                c.run(),
                _file("./test/specimens/bare-js/_config.config")
            );
        });
    });
});
