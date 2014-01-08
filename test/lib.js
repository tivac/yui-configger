/*jshint node :true */
/*global describe, it */

"use strict";

var assert = require("assert"),
    fixup  = require("../lib/lib.js").pathFixup;
    
describe("yui-configger", function() {
    describe("lib", function() {
        it("should provide a `pathFixup` function", function() {
            assert(fixup);
            assert.equal(typeof fixup, "function");
        });
        
        it("should return falsey/non-string values unchanged", function() {
            var o = { fooga : true };
            
            assert.equal(fixup(false), false);
            assert.equal(fixup(undefined), undefined);
            assert.equal(fixup(o), o);
        });
        
        it("should normalize an empty string to '/'", function() {
            assert(fixup(""), "/");
        });
        
        it("should remove leading '.'s from paths", function() {
            assert(fixup("./"), "/");
        });
        
        it("should normalize separators to '/'", function() {
            assert.equal(fixup("\\a\\b"), "/a/b/");
        });
        
        it("should add a leading '/' if necessary", function() {
            assert.equal(fixup("a/b"), "/a/b/");
            assert.notEqual(fixup("/a/b"), "//a/b/");
        });
        
        it("should add a trailing '/' if necessary", function() {
            assert.equal(fixup("a/b"), "/a/b/");
            assert.notEqual(fixup("a/b/"), "/a/b//");
        });
    });
});
