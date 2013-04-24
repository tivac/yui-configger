/*jshint node:true */
/*global describe, it, before, after */

"use strict";

var assert = require("assert"),
    Group  = require("../lib/group.js");

describe("YUI Configger", function() {
    describe("Group Class", function() {
        it("should store its name", function() {
            var g = new Group("test");
            
            assert.equal(g.name, "test");
        });
        
        it("should start out with no modules", function() {
            var g = new Group("test");
            
            assert.equal(g.modules.length, 0);
        });
    });
});
