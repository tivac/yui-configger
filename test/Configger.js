/*jshint node:true */
/*global describe, it */

"use strict";

var path      = require("path"),
    assert    = require("assert"),
    
    Configger = require("../lib/configger"),

    _file     = require("./_file");

describe("yui-configger", function() {
    describe("Configger Class", function() {
        it("should load defaults from args.json", function() {
            var c = new Configger({
                    root : "./test/specimens/simple/"
                });
            
            assert.equal(c.options.root,      path.normalize("./test/specimens/simple/"));
            assert.equal(c.options.dirs[0],   path.normalize("./test/specimens/simple/"));
            assert.equal(c.options.tmpl,      "_config-template.js");
            assert.equal(c.options.filter,    "/./");
            assert.equal(c.options.prefix,    "");
            assert.equal(c.options.cssprefix, "css-");
            assert.equal(c.options.loglevel,  "info");
        });
        
        it("shouldn't load defaults when the CLI provided them", function() {
            var c = new Configger({
                    "$0"      : true,
                    root      : "./test/specimens/simple/",
                    _         : [ "./test/specimens/simple/" ],
                    extensions: "jss,css",
                    tmpl      : "_config-template.js",
                    filter    : "fooga.js",
                    prefix    : "wooga",
                    verbose   : false,
                    silent    : false,
                    loglevel  : "verbose"
                });
            
            assert.equal(c.options.root,      path.normalize("./test/specimens/simple/"));
            assert.equal(c.options.dirs[0],   path.normalize("./test/specimens/simple/"));
            assert.equal(c.options.tmpl,      "_config-template.js");
            assert.equal(c.options.filter,    "/fooga.js/");
            assert.equal(c.options.prefix,    "wooga");
            assert.equal(c.options.exts[0],   ".jss");
        });

        it("should respect the loglevel shortcuts", function() {
            var verbose = new Configger({ root : ".", verbose : true }),
                silent  = new Configger({ root : ".", silent : true });
            
            assert.equal(verbose.options.loglevel, "verbose");
            assert.equal(silent.options.loglevel,  "silent");
        });

        it("should always require that a `root` value is set", function() {
            assert.throws(
                function() {
                    new Configger();
                },
                Error
            );
        });

        it("should ensure that all extensions are prefixed with \".\"", function() {
            var c = new Configger({
                    root       : "./test/specimens/simple",
                    extensions : ".js, css"
                });

            assert.equal(c.options.exts[0], ".js");
            assert.equal(c.options.exts[1], ".css");
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
                    root       : "./test/specimens/mixed/",
                    extensions : "js, css, mjs"
                }),
                modules = c._modules();
            
            assert(modules.length);
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
        
        it("should find a config template on the file system", function() {
            var c   = new Configger({
                    root : "./test/specimens/simple/"
                }),
                ast = c._config();
            
            assert(ast);
            assert.equal(ast.type, "Program");
        });
        
        it("should handle not finding a config template on the file system", function() {
            var c = new Configger({
                    root : "./test/specimens/empty/"
                });
            
            assert.equal(c._config(), undefined);
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
                    root       : "./test/specimens/mixed",
                    silent     : true,
                    extensions : "mjs"
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
    });
});
