/*jshint node:true */

"use strict";

var assert = require("assert"),
    cfg    = require("../lib/config-template");

describe("yui-configger", function() {
    describe("config-template", function() {
        it("should provide a find method", function() {
            assert(cfg.find);
            assert.equal(typeof cfg.find, "function");
        });
        
        it("should find a config file on disk", function() {
            var source = cfg.find("./test/specimens/simple", "**/_config-template.js");
            
            assert(source);
        });
    });
});
