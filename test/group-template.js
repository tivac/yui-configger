/*jshint node:true */

"use strict";
var assert = require("assert"),
    group  = require("../lib/group-template");

describe("yui-configger", function() {
    describe("group-template", function() {
        it("should provide a find method", function() {
            assert(group.find);
            assert.equal(typeof group.find, "function");
        });
        
        it("should find a group template in an AST", function() {
            var ast = require("./specimens/group-template/ast.js"),
                tmpl = group.find(ast);
            
            assert(tmpl);
            assert.deepEqual(tmpl, require("./specimens/group-template/partial-ast.js"));
        });
    });
});
