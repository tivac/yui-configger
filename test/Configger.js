/*jshint node :true */
/*global describe, it, before, after */

"use strict";

var assert    = require("assert"),
    Configger = require("../lib/index.js");

describe("YUI Configger", function() {
    describe("Configger Class", function() {
        it("should load defaults from args.json", function() {
            var c = new Configger({ root : "./test/specimens/simple/" });
            
            assert.equal(c.options.root, "./test/specimens/simple/");
            assert.equal(c.options.tmpl, "_config-template.js");
            assert.equal(c.options.filter.toString(), "/./");
            assert.equal(c.options.extension.toString(), "/js/");
            assert.equal(c.options.prefix, "");
        });
        
        it("should find modules on the file system", function() {
            var c = new Configger({ root : "./test/specimens/simple/" }),
                modules = c._modules();
            
            assert(modules.length);
        });
        
        it("should create groups from directories on the file system", function() {
            var c = new Configger({ root : "./test/specimens/simple/" }),
                groups = c._groups();
                
            assert(groups);
            assert(Object.keys(groups).length);
            assert(groups["/subfolder/"]);
        });
        
        it("should find a config template on the file system", function() {
            var c = new Configger({ root : "./test/specimens/simple/" }),
                ast = c._config();
            
            assert(ast);
            assert.equal(ast.type, "Program");
        });
        
        it("should parse a group template out of the config template", function() {
            var c = new Configger({ root : "./test/specimens/group-template/" }),
                config = c._config(),
                template;
                
            assert(config);
            
            template = c._template(config);
            
            assert(template);
            assert(template.key);
            assert.equal(template.key.name, "$group");
        });
        
        // Skipped until we support not using a group template in some form
        it.skip("should return a config string from run (simple)", function() {
            var c = new Configger({ root : "./test/specimens/simple/" }),
                result = c.run();
            
            console.log("result:", result);
        });
        
        it("should return a config string from run (group-template)", function() {
            var c = new Configger({ root : "./test/specimens/group-template/" }),
                result = c.run();
            
            // TODO: better assertions (try to re-parse into AST & verify against that?)
            assert(result.indexOf("var test_config") > -1);
            assert(result.indexOf("module-b") > -1);
            assert(result.indexOf("/subfolder/sub-subfolder/") > -1);
            assert(result.indexOf("module-c") > -1);
        });
    });
});
