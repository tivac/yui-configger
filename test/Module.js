/*jshint node:true */
/*global describe, it, before, after */

"use strict";

var path   = require("path"),
    assert = require("assert"),
    Module = require("../lib/module.js");

describe("YUI Configger", function() {
    describe("Module Class", function() {
        it("should instantiate", function() {
            new Module();
        });
        
        it("should read a file", function() {
            var m = new Module({ file : "./test/specimens/simple/a.js", root : "./test/specimens/simple/" });
            
            m._read();
            
            assert(m._src.length);
        });
        
        it("should parse files", function() {
            var m = new Module({ file : "./test/specimens/simple/a.js", root : "./test/specimens/simple/" }),
                result;
            
            result = m.load();
            
            assert.equal(result, true);
            assert.equal(m.name, "module-a");
            assert.equal(m.group, "/test/specimens/simple/");
        });
    });
});
