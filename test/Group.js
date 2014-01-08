/*jshint node:true */
/*global describe, it */

"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    Group  = require("../lib/group.js"),
    Module = require("../lib/module.js");

describe("yui-configger", function() {
    describe("Group", function() {
        it("should store its name", function() {
            var g = new Group({ name : "test" });
            
            assert.equal(g.name, "test");
        });
        
        it("should use the prefix for the name", function() {
            var g = new Group({
                    name : "test",
                    prefix : "a"
                });
            
            assert.equal(g.name, "atest");
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
        
        it("shouldn't include modules w/o files", function() {
            var g = new Group(),
                modules;
            
            g.modules.push(new Module());
            
            modules = g._modulesAST();
            
            assert.equal(modules.value.properties.length, 0);
        });
        
        it("should generate a brand-new AST", function() {
            var g = new Group({ name : "test" }),
                ast, aRoot;
            
            g.modules.push(new Module({ file : "./test/specimens/simple/a.js" }));
            
            ast = g.ast;
            
            // This gets... fun
            // group name
            assert.equal(ast.key.value, g.name);
            // base
            assert.equal(ast.value.properties[0].key.name, "base");
            // modules object
            assert.equal(ast.value.properties[1].key.name, "modules");
            
            aRoot = ast.value.properties[1].value.properties[0];
            
            // module-a definition
            assert.equal(aRoot.key.value, "module-a");
            // module-a path key
            assert.equal(aRoot.value.properties[0].key.name, "path");
            // module-a path value
            assert.equal(aRoot.value.properties[0].value.value, "a.js");
            // module-a requires key
            assert.equal(aRoot.value.properties[1].key.name, "requires");
            // module-a requires value
            assert.equal(aRoot.value.properties[1].value.elements[0].value, "module-b");
        });
        
        it("should generate an AST from a template", function() {
            var g, ast, aRoot;
            
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
            assert.equal(ast.key.value, g.name);
            // group base
            assert.equal(ast.value.properties[0].value.value, g.dir);
            // modules object
            assert.equal(ast.value.properties[1].key.name, "modules");
            
            aRoot = ast.value.properties[1].value.properties[0];
            
            // module-a definition
            assert.equal(aRoot.key.value, "module-a");
            // module-a path key
            assert.equal(aRoot.value.properties[0].key.name, "path");
            // module-a path value
            assert.equal(aRoot.value.properties[0].value.value, "a.js");
            // module-a requires key
            assert.equal(aRoot.value.properties[1].key.name, "requires");
            // module-a requires value
            assert.equal(aRoot.value.properties[1].value.elements[0].value, "module-b");
        });
        
        it("should update existing ast objects (Identifier modules property)", function() {
            var g;
            
            g = new Group({
                name     : "fooga",
                dir      : "/specimens/simple/",
                existing : require("./specimens/simple/_existing-ast.json")
            });
            
            g.modules.push(new Module({ file : "./test/specimens/simple/a.js" }));
            
            assert.equal(
                JSON.stringify(g.ast, null, 4),
                JSON.stringify(require("./specimens/simple/_existing-ast-result.json"), null, 4)
            );
        });

        it("should update existing ast objects (Literal \"modules\" property)", function() {
            var g;
            
            g = new Group({
                name     : "fooga",
                dir      : "/specimens/simple/",
                existing : require("./specimens/simple/_existing-ast-literal.json"),
            });
            
            g.modules.push(new Module({ file : "./test/specimens/simple/a.js" }));
            
            assert.equal(
                JSON.stringify(g.ast, null, 4),
                JSON.stringify(require("./specimens/simple/_existing-ast-literal-result.json"), null, 4)
            );
        });

        it("should only update base/root values that contain \"{dir}\"", function() {
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
                            }, {
                                type : "Property",
                                key : {
                                    type : "Identifier",
                                    name : "root"
                                },
                                value : {
                                    type  : "Literal",
                                    value : "{dir",
                                    raw   : "\"{dir\""
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
            
            assert.equal(ast.value.properties[0].value.value, "/test/specimens/simple/");
            assert.equal(ast.value.properties[0].value.raw, "\"/test/specimens/simple/\"");
            
            assert.equal(ast.value.properties[1].value.value, "{dir");
            assert.equal(ast.value.properties[1].value.raw, "\"{dir\"");
        });
    });
});
