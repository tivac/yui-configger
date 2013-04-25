/*jshint node:true */
/*global describe, it, before, after */

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
        
        it("should have the name getter implicitly call load()", function() {
            var m = new Module({ file : "./test/specimens/simple/a.js" });
            
            assert.equal(m.name, "module-a");
            assert(m._src);
        });
        
        it("should have the group getter implicitly call load()", function() {
            var m = new Module({ file : "./test/specimens/simple/a.js" });
            
            assert.equal(m.group, "/test/specimens/simple/");
            assert(m._src);
        });
        
        it("should bail if passed an invalid file", function() {
            var m = new Module({ file : "./test/specimens/simple/fooga.js" });
            
            assert.throws(function() {
                m.load();
            });
        });
        
        it("should not attempt to parse if _src is falsey", function() {
            var m = new Module({ file : "./test/specimens/simple/fooga.js" });
            
            assert.equal(m._parse(), undefined);
        });
        
        it("should not attempt to parse invalid YUI modules", function() {
            var m = new Module({ file : "./test/specimens/simple/_config-template.js" });
            
            assert.equal(m.load(), "Invalid YUI module");
        });
        
        it("should bail on parsing if no name is specified", function() {
            var m = new Module({ file : "./test/specimens/simple/fooga.js" });
            
            m._src = "YUI.add(null, function(){});";
            
            assert.equal(m._parse(), "Module has no name");
        });
        
        it("should not parse if esprima cannot create an AST", function() {
            var m = new Module({ file : "./test/specimens/simple/fooga.js" });
            
            m._src = "var var = 5";
            assert.equal(m._parse(), undefined);
        });
        
        it("should make the group name relative to the root", function() {
            var m = new Module({
                    file : "./test/specimens/simple/a.js",
                    root : "./test/specimens/simple/"
                });
            
            assert.equal(m.group, "/");
        });
        
        it("should parse files", function() {
            var m = new Module({ file : "./test/specimens/simple/a.js" }),
                result;
            
            result = m.load();
            
            assert.equal(result, true);
            assert.equal(m.name, "module-a");
            assert.equal(m.group, "/test/specimens/simple/");
            assert(Object.keys(m.config));
        });
        
        it("should use a default module config if one isn't defined", function() {
            var m   = new Module({ file : "./test/specimens/simple/c.js" }),
                ast = m.config;
            
            assert.equal(ast.type, "ObjectExpression");
            assert(ast.properties.length);
            assert(ast.properties[0].value.value, "c.js");
        });
    });
});
