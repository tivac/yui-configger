/*jshint node:true */
/*global describe, it */

"use strict";

var assert = require("assert"),
    Module = require("../lib/module.js");

describe("yui-configger", function() {
    describe("Module Class", function() {
        it("should instantiate", function() {
            new Module({
                file : "./test/specimens/simple/a.js",
                type : "js"
            });
        });
        
        it("should require both file & type be specified", function() {
            assert.throws(function() {
                new Module();
            });

            assert.throws(function() {
                new Module({
                    file : "./test/specimens/simple/a.js"
                });
            });

            assert.throws(function() {
                new Module({
                    type : "js"
                });
            });
        });

        it("should read a JS file", function() {
            var m = new Module({
                    file : "./test/specimens/simple/a.js",
                    type : "js"
                });
            
            assert(m._src);
            assert(m._src.length > 0);
        });

        it("should read a CSS file", function() {
            var m = new Module({
                    file : "./test/specimens/mixed/css/a.css",
                    type : "css"
                });
            
            assert(m._src);
            assert(m._src.length > 0);
        });
        
        it("should provide getters for simple values", function() {
            var js = new Module({
                    file : "./test/specimens/simple/a.js",
                    type : "js"
                }),
                css = new Module({
                    file : "./test/specimens/mixed/css/a.css",
                    type : "css"
                });
            
            assert.equal(js.file, "./test/specimens/simple/a.js");
            assert.equal(js.type, "js");
            assert.equal(js.name, "module-a");
            assert(js.config);

            assert.equal(css.file, "./test/specimens/mixed/css/a.css");
            assert.equal(css.type, "css");
            assert.equal(css.name, "a");
            assert(css.config);
        });

        it("should provide a `valid` getter to check validity", function() {
            var js = new Module({
                    file : "./test/specimens/simple/a.js",
                    type : "js"
                }),
                css = new Module({
                    file : "./test/specimens/mixed/css/a.css",
                    type : "css"
                });

            assert(js.valid);
            assert(css.valid);
        });

        it("should not generate config if passed an invalid file", function() {
            assert.throws(function() {
                new Module({
                    file : "./test/specimens/simple/fooga.js",
                    type : "js"
                });
            });
        });
        
        it("should not generate config if file is not a YUI modules (JS)", function() {
            var m = new Module({
                    file : "./test/specimens/not-module.js",
                    type : "js"
                });
            
            assert.equal(m.config, undefined);
        });

        it("should not generate config if no name is specified (JS)", function() {
            var m = new Module({
                    file : "./test/specimens/no-name.js",
                    type : "js"
                });
            
            assert.equal(m.config, undefined);
        });
        
        it("should not generate config if esprima cannot create an AST (JS)", function() {
            var m = new Module({
                    file : "./test/specimens/invalid.js",
                    type : "js"
                });
            
            assert.equal(m.config, undefined);
        });
        
        it("should use a default module config if one isn't defined", function() {
            var js = new Module({
                    file : "./test/specimens/simple/c.js",
                    type : "js"
                }),
                css = new Module({
                    file : "./test/specimens/mixed/css/a.css",
                    type : "css"
                });
            
            assert.equal(js.config.type, "ObjectExpression");
            assert(js.config.properties.length);
            assert(js.config.properties[0].value.value, "c.js");

            assert.equal(css.config.type, "ObjectExpression");
            assert(css.config.properties.length);
            assert(css.config.properties[0].value.value, "a.css");
        });
    });
});
