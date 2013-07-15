/*jshint node:true */
/*global describe, it */

"use strict";

var fs        = require("fs"),
    path      = require("path"),
    assert    = require("assert"),
    Configger = require("../lib/index.js");

describe("YUI Configger", function() {
    describe("Configger Class", function() {
        it("should load defaults from args.json", function() {
            var c = new Configger({ root : "./test/specimens/simple/" });
            
            assert.equal(c.options.root, "./test/specimens/simple/");
            assert.equal(c.options.tmpl, "_config-template.js");
            assert.equal(c.options.filter.toString(), "/./");
            assert.equal(c.options.extension.toString(), "/^\\.js$/");
            assert.equal(c.options.prefix, "");
        });
        
        it("shouldn't load defaults when the CLI provided them", function() {
            var c = new Configger({
                    cli       : true,
                    root      : "./test/specimens/simple/",
                    tmpl      : "_config-template.js",
                    filter    : ".",
                    extension : "^\\.js$",
                    prefix    : ""
                });
            
            assert.equal(c.options.root, "./test/specimens/simple/");
            assert.equal(c.options.tmpl, "_config-template.js");
            assert.equal(c.options.filter.toString(), "/./");
            assert.equal(c.options.extension.toString(), "/^\\.js$/");
            assert.equal(c.options.prefix, "");
        });
        
        it("should log to the console", function() {
            var c = new Configger({
                    root  : "./test/specimens/simple/",
                    quiet : false
                });
            
            c.console = {
                log : function() {
                    assert(true)
                }
            };
            
            c._console("log", "test");
        });
        
        it("should find modules on the file system", function() {
            var c       = new Configger({ root : "./test/specimens/simple/" }),
                modules = c._modules();
            
            assert(modules.length);
        });
        
        it("should find directories on the file system", function() {
            var c    = new Configger({ root : "./test/specimens/simple/" }),
                dirs = c._dirs();
                
            assert(dirs.length);
            assert.equal(dirs[0], "");
            assert.equal(dirs[1], "empty");
            assert.equal(dirs[2], "subfolder");
        });
        
        it("should find deeply-nested directories on the file system", function() {
            var c    = new Configger({ root : "./test/specimens/standard/" }),
                dirs = c._dirs();
                
            assert(dirs.length);
            assert.equal(dirs[0], "");
            assert.equal(dirs[1], "subfolder");
            assert.equal(dirs[2], "subfolder-b");
            assert.equal(dirs[3], "subfolder-b" + path.sep + "sub-subfolder");
            assert.equal(dirs[4], "subfolder-b" + path.sep + "sub-subfolder" + path.sep + "sub-sub-subfolder");
        });
        
        it("should create groups from directories on the file system", function() {
            var c      = new Configger({ root : "./test/specimens/simple/" }),
                groups = c._groups();
            
            assert(groups);
            assert(Object.keys(groups).length);
            assert(groups["/"]);
            assert(groups["/subfolder/"]);
        });
        
        it("should find a config template on the file system", function() {
            var c   = new Configger({ root : "./test/specimens/simple/" }),
                ast = c._config();
            
            assert(ast);
            assert.equal(ast.type, "Program");
        });
        
        it("should handle not finding a config template on the file system", function() {
            var c   = new Configger({ root : "./test/specimens/empty/" }),
                ast = c._config();
                
            assert.equal(ast, undefined);
        });
        
        it("should parse a group template out of the config template", function() {
            var c      = new Configger({ root : "./test/specimens/group-template/" }),
                config = c._config(),
                template;
                
            assert(config);
            
            template = c._template(config);
            
            assert(template);
            assert(template.key);
            assert.equal(template.key.name, "$group");
        });
        
        it("should return a config string from run (simple)", function() {
            var c = new Configger({ root : "./test/specimens/simple/", quiet : true });
            
            assert.equal(
                c.run() + "\n",
                fs.readFileSync("./test/specimens/simple/_config.js", "utf8")
            );
        });
        
        it("should return a config string from run (group-template)", function() {
            var c = new Configger({ root : "./test/specimens/group-template/", quiet : true });
               
            assert.equal(
                c.run() + "\n",
                fs.readFileSync("./test/specimens/group-template/_config.js", "utf8")
            );
        });
        
        it("should return a config string from run (standard)", function() {
            var c = new Configger({ root : "./test/specimens/standard/", quiet : true });
           
            assert.equal(
                c.run() + "\n",
                fs.readFileSync("./test/specimens/standard/_config.js", "utf8")
            );
        });
        
        it("should bail if no ast can be generated", function() {
            var c = new Configger({ root : "./test/specimens/empty/", quiet : true });
                
            assert.equal(c.run(), undefined);
        });
    });
});
