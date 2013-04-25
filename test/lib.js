/*jshint node :true */
/*global describe, it, before, after */

"use strict";

var assert = require("assert"),
    lib    = require("../lib/lib.js");
    
describe("YUI Configger", function() {
    describe("lib", function() {
        it("should provide a `pathFixup` function", function() {
            assert(lib.pathFixup);
            assert.equal(typeof lib.pathFixup, "function");
        });
        
        it("should remove leading '.'s from paths", function() {
            assert(lib.pathFixup("./"), "/");
        });
        
        it("should normalize separators to '/'", function() {
            assert.equal(lib.pathFixup("\\a\\b"), "/a/b/");
        });
        
        it("should add a leading '/' if necessary", function() {
            assert.equal(lib.pathFixup("a/b"), "/a/b/");
            assert.notEqual(lib.pathFixup("/a/b"), "//a/b/");
        });
        
        it("should add a trailing '/' if necessary", function() {
            assert.equal(lib.pathFixup("a/b"), "/a/b/");
            assert.notEqual(lib.pathFixup("a/b/"), "/a/b//");
        });
    });
});
