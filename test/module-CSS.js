/*jshint node:true */
/*global describe, it */

"use strict";

var assert    = require("assert"),
    CSSModule = require("../lib/modules/css");

describe("yui-configger", function() {
    describe("CSS Module Class", function() {
        it("should instantiate", function() {
            new CSSModule({
                file : "./test/specimens/mixed/css/a.css"
            });
        });
        
        it("should read a CSS file", function() {
            var css = new CSSModule({
                    file : "./test/specimens/mixed/css/a.css"
                });
            
            assert(css._src);
            assert(css._src.length > 0);
        });
        
        it("should use a default module config if one isn't defined", function() {
            var css = new CSSModule({
                    file : "./test/specimens/mixed/css/a.css"
                });
            
            assert.equal(css.config.type, "ObjectExpression");
            assert(css.config.properties.length);
            assert(css.config.properties[0].value.value, "a.css");
        });
    });
});
