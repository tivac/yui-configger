/*jshint node :true */
/*global describe, it, before, after */

"use strict";

var assert = require("assert"),
    Group  = require("../lib/group.js"),
    Module = require("../lib/module.js");

describe("YUI Configger", function() {
    describe("Group", function() {
        it("should store its name", function() {
            var g = new Group({ name : "test" });
            
            assert.equal(g.name, "test");
        });
        
        it("should strip a leading \".\" from the dir value", function() {
            var g = new Group({
                    name : "test",
                    dir  : "./test/specimens/simple/"
                });
            
            assert.equal(g.dir, "/test/specimens/simple/");
        });
        
        it("should add a leading \"/\" to the dir value", function() {
            var g = new Group({
                    name : "test",
                    dir  : "test/specimens/simple/"
                });
            
            assert.equal(g.dir, "/test/specimens/simple/");
        });
        
        it("should add a trailing \"/\" to the dir value", function() {
            var g = new Group({
                    name : "test",
                    dir  : "/test/specimens/simple"
                });
            
            assert.equal(g.dir, "/test/specimens/simple/");
        });
        
        it("should convert all path separators to \"/\"", function() {
            var g;
            
            g = new Group({
                name : "test",
                dir  : "test\\specimens\\simple\\"
            });
            
            assert.equal(g.dir, "/test/specimens/simple/");
        });
        
        it("should start out with no modules", function() {
            var g = new Group({ name : "test" });
            
            assert.equal(g.modules.length, 0);
        });
        
        it("should be possible to push new modules into the group", function() {
            var g = new Group({ name : "test" });
            
            g.modules.push("module");
            
            assert.equal(g.modules.length, 1);
            assert.equal(g.modules[0], "module");
        });
        
        it("should generate a brand-new AST", function() {
            var g = new Group({ name : "test" });
            
            g.modules.push(new Module({ file : "./test/specimens/simple/a.js" }));
            
            // This gets... fun
            // group name
            assert.equal(g.ast.key.value, g.name);
            // modules object
            assert.equal(g.ast.value.properties[0].key.name, "modules");
            // module-a definition
            assert.equal(g.ast.value.properties[0].value.properties[0].key.value, "module-a");
            // module-a path key
            assert.equal(g.ast.value.properties[0].value.properties[0].value.properties[0].key.name, "path");
            // module-a path value
            assert.equal(g.ast.value.properties[0].value.properties[0].value.properties[0].value.value, "a.js");
            // module-a requires key
            assert.equal(g.ast.value.properties[0].value.properties[0].value.properties[1].key.name, "requires");
            // module-a requires value
            assert.equal(g.ast.value.properties[0].value.properties[0].value.properties[1].value.elements[0].value, "b");
        });
        
        it("should generate an AST from a template", function() {
            var g, ast;
            
            g = new Group({
                name     : "test",
                dir      : "./test/specimens/simple/",
                template : {
                    type : "Property",
                    key : {
                        type : "Identifier",
                        name : "$group"
                    },
                    value : {
                        type : "ObjectExpression",
                        properties : [
                            {
                                type : "Property",
                                key : {
                                    type : "Identifier",
                                    name : "base"
                                },
                                value : {
                                    type  : "Literal",
                                    value : "{dir}",
                                    raw   : "\"{dir}\""
                                },
                                kind : "init"
                            }
                        ]
                    },
                    kind : "init"
                }
            });
            
            g.modules.push(new Module({ file : "./test/specimens/simple/a.js" }));
            
            ast = g.ast;
            
            // group name
            assert.equal(g.ast.key.value, g.name);
            // group base
            assert.equal(g.ast.value.properties[0].value.value, g.dir);
            // modules object
            assert.equal(g.ast.value.properties[1].key.name, "modules");
            // module-a definition
            assert.equal(g.ast.value.properties[1].value.properties[0].key.value, "module-a");
            // module-a path key
            assert.equal(g.ast.value.properties[1].value.properties[0].value.properties[0].key.name, "path");
            // module-a path value
            assert.equal(g.ast.value.properties[1].value.properties[0].value.properties[0].value.value, "a.js");
            // module-a requires key
            assert.equal(g.ast.value.properties[1].value.properties[0].value.properties[1].key.name, "requires");
            // module-a requires value
            assert.equal(g.ast.value.properties[1].value.properties[0].value.properties[1].value.elements[0].value, "b");
        });
        
        it("should update existing ast objects");
    });
});
