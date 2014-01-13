/*jshint node:true */
/*global describe, it */

"use strict";

var fs        = require("fs"),
    path      = require("path"),
    assert    = require("assert"),
    
    Configger = require("../lib/configger.js");

describe("yui-configger", function() {
    describe("Configger Class", function() {
        it("should load defaults from args.json", function() {
            var c = new Configger({ root : "./test/specimens/simple/" });
            
            assert.equal(c.options.root,            "./test/specimens/simple/");
            assert.equal(c.options.tmpl,            "_config-template.js");
            assert.equal(c.options.filter,          ".");
            assert.equal(c.options.extension,       "^\\.js$");
            assert.equal(c.options.prefix,          "");
            assert.equal(c.options.cssextension,    "^\\.css$");
            assert.equal(c.options.cssprefix,       "css-");
        });
        
        it("shouldn't load defaults when the CLI provided them", function() {
            var c = new Configger({
                    "$0"      : true,
                    root      : "./test/specimens/simple/",
                    tmpl      : "_config-template.js",
                    filter    : "fooga.js",
                    extension : "^\\.jss$",
                    prefix    : "",
                    verbose   : true
                });
            
            assert.equal(c.options.root,        "./test/specimens/simple/");
            assert.equal(c.options.tmpl,        "_config-template.js");
            assert.equal(c.options.filter,      "fooga.js");
            assert.equal(c.options.extension,   "^\\.jss$");
            assert.equal(c.options.prefix,      "");
            assert.equal(c.options.verbose,     true);
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
            var c = new Configger({ root : "./test/specimens/empty/" });
            
            assert.equal(c._config(), undefined);
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
            var c = new Configger({
                    root  : "./test/specimens/simple/",
                    level : "silent"
                });
            
            assert.equal(
                c.run() + "\n",
                fs.readFileSync("./test/specimens/simple/_config.js", "utf8")
            );
        });
        
        it("should return a config string from run (group-template)", function() {
            var c = new Configger({
                    root  : "./test/specimens/group-template/",
                    level : "silent"
                });
               
            assert.equal(
                c.run() + "\n",
                fs.readFileSync("./test/specimens/group-template/_config.js", "utf8")
            );
        });
        
        it("should return a config string from run (standard)", function() {
            var c = new Configger({
                    root  : "./test/specimens/standard/",
                    level : "silent"
                });
           
            assert.equal(
                c.run() + "\n",
                fs.readFileSync("./test/specimens/standard/_config.js", "utf8")
            );
        });

        it("should return a config string from run (mixed)", function() {
            var c = new Configger({
                    root  : "./test/specimens/mixed/",
                    level : "silent"
                });
           
            assert.equal(
                c.run() + "\n",
                fs.readFileSync("./test/specimens/mixed/_config.js", "utf8")
            );
        });

        it("should return a config string containing CSS from run (mixed)", function() {
            var c = new Configger({
                    root  : "./test/specimens/mixed/",
                    level : "silent",
                    css   : true
                });
           
            assert.equal(
                c.run() + "\n",
                fs.readFileSync("./test/specimens/mixed/_config-css.js", "utf8")
            );
        });
        
        it("should bail if no ast can be generated", function() {
            var c = new Configger({
                    root  : "./test/specimens/empty/",
                    level : "silent"
                });
                
            assert.equal(c.run(), undefined);
        });
    });
});
