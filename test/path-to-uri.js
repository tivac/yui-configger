/*jshint node :true */
/*global describe, it */

"use strict";

var assert = require("assert"),
    pathToUri  = require("../lib/path-to-uri.js");
    
describe("yui-configger", function() {
    describe("pathToUri", function() {
        it("should provide a function", function() {
            assert(pathToUri);
        });
        
        it("should return falsey/non-string values unchanged", function() {
            var o = { fooga : true };
            
            assert.equal(pathToUri(false), false);
            assert.equal(pathToUri(undefined), undefined);
            assert.equal(pathToUri(o), o);
        });
        
        it("should normalize empty strings to '/'", function() {
            assert.equal(pathToUri(""), "/");
        });
        
        it("should remove leading '.'s from paths", function() {
            assert.equal(pathToUri("./"), "/");
        });
        
        it("should normalize separators to '/'", function() {
            assert.equal(pathToUri("\\a\\b"), "/a/b/");
        });
        
        it("should add a leading '/' if necessary", function() {
            assert.equal(pathToUri("a/b"), "/a/b/");
            assert.notEqual(pathToUri("/a/b"), "//a/b/");
        });
        
        it("should add a trailing '/' if necessary", function() {
            assert.equal(pathToUri("a/b"), "/a/b/");
            assert.notEqual(pathToUri("a/b/"), "/a/b//");
        });
    });
});
