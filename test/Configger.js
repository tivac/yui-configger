/*jshint node :true */
/*global describe, it, before, after */

"use strict";

var assert    = require("assert"),
    Configger = require("../lib/index.js"),
    Group     = require("../lib/group.js"),
    Module    = require("../lib/module.js");

describe("YUI Configger", function() {
    describe.skip("Configger Class", function() {
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
                files = c._files();
            
            assert(files.length);
        });
        
        it("should find a config template on the file system", function() {
            var c = new Configger({ root : "./test/specimens/simple/" }),
                template = c._template();
                
            assert(template.length);
        });
        
        it("should return a config string from run (simple)", function() {
            var c = new Configger({ root : "./test/specimens/simple/" }),
                result = c.run();
            
            //console.log("result:", result);
        });
        
        it("should return a config string from run (group-template)", function() {
            var c = new Configger({ root : "./test/specimens/group-template/" }),
                result = c.run();
            
            //console.log("result:", result);
        });
    });
});
