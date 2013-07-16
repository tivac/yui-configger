/*jshint node:true */
/*global describe, it */

"use strict";

var assert = require("assert"),
    Module = require("../lib/module.js");

describe("YUI Configger", function() {
    describe("Module", function() {
        it("should instantiate", function() {
            new Module();
        });
        
        it("should read a file", function() {
            var m = new Module({ file : "./test/specimens/simple/a.js" });
            
            m._read();
            
            assert(m._src.length);
        });
        
        it("should provide a file getter", function() {
            var m = new Module({ file : "./test/specimens/simple/a.js" });
            
            assert.equal(m.file, "./test/specimens/simple/a.js");
        });
        
        it("should bail if passed an invalid file", function() {
            assert.throws(function() {
                new Module({ file : "./test/specimens/simple/fooga.js" });
            });
        });
        
        it("should not attempt to parse if _src is falsey", function() {
            var m = new Module();
            
            assert.equal(m._parse(), undefined);
        });
        
        it("should load a file if `file` is set after instantiation", function() {
            var m = new Module();
            
            m.file = "./test/specimens/simple/a.js";
            
            assert.equal(m.name, "module-a");
        });
        
        it("should not attempt to parse invalid YUI modules", function() {
            var m = new Module({ file : "./test/specimens/simple/_config-template.js" });
            
            assert.equal(m.load(), "Invalid YUI module");
        });
        
        it("should bail on parsing if no name is specified", function() {
            var m = new Module();
            
            m._src = "YUI.add(null, function(){});";
            
            assert.equal(m._parse(), "Module has no name");
        });
        
        it("should not parse if esprima cannot create an AST", function() {
            var m = new Module();
            
            m._src = "var var = 5";
            assert.equal(m._parse(), "Unable to parse: " + undefined);
        });
        
        it("should parse files", function() {
            var m = new Module({ file : "./test/specimens/simple/a.js" }),
                result;
            
            result = m.load();
            
            assert.equal(result, true);
            assert.equal(m.name, "module-a");
            assert(Object.keys(m.config));
        });
        
        it("should use a default module config if one isn't defined", function() {
            var m   = new Module({ file : "./test/specimens/simple/c.js" }),
                ast = m.config;
            
            assert.equal(ast.type, "ObjectExpression");
            assert(ast.properties.length);
            assert(ast.properties[0].value.value, "c.js");
        });
        
        it("should update module validity", function() {
            var m  = new Module(),
                m2 = new Module();
            
            assert.equal(m.valid, false);
            assert.equal(m2.valid, false);
            
            m.file = "./test/specimens/simple/a.js";
            
            assert.equal(m.valid, true);
            
            m2._src = "var var = 5";
            m2._parse();
            
            assert.equal(m2.valid, false);
        });
    });
});
