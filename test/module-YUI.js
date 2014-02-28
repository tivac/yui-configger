/*jshint node:true */
/*global describe, it */

"use strict";

var assert    = require("assert"),
    YUIModule = require("../lib/modules/yui");

describe("yui-configger", function() {
    describe("YUI Module Class", function() {
        it("should instantiate", function() {
            new YUIModule({
                file : "./test/specimens/simple/a.js"
            });
        });

        it("should not allow invalid code", function() {
            assert.throws(function() {
                new YUIModule({
                    file : "./test/specimens/invalid.js"
                });
            });
        });
        
        it("should provide a `valid` fn to check validity", function() {
            var yui = new YUIModule({
                    file : "./test/specimens/simple/a.js"
                });

            assert(yui.valid());
        });

        it("should not generate config if passed an invalid file", function() {
            assert.throws(function() {
                new YUIModule({
                    file : "./test/specimens/simple/fooga.js"
                });
            });
        });
        
        it("should not generate config if file is not a YUI modules", function() {
            var yui = new YUIModule({
                    file : "./test/specimens/not-module.js"
                });
            
            assert.equal(yui.config, undefined);
        });

        it("should bail if no name is specified", function() {
            assert.throws(function() {
                new YUIModule({
                    file : "./test/specimens/no-name.js"
                });
            });
        });
        
        it("should use a default module config if one isn't defined", function() {
            var yui = new YUIModule({
                    file : "./test/specimens/simple/c.js"
                });
            
            assert.equal(yui.config.type, "ObjectExpression");
            assert(yui.config.properties.length);
            assert(yui.config.properties[0].value.value, "c.js");
        });
    });
});
