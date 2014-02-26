/*jshint node:true */
"use strict";

var fs       = require("fs"),
    assert   = require("assert"),
    
    JSModule = require("../lib/modules/js");

describe("yui-configger", function() {
    describe("JSModule Class", function() {
        it("should instantiate", function() {
            new JSModule({
                file : "./test/specimens/not-module.js"
            });
        });
        
        it("should require a file be specified", function() {
            assert.throws(function() {
                new JSModule();
            });

            assert.doesNotThrow(function() {
                new JSModule({
                    file : "./test/specimens/simple/a.js"
                });
            });
        });

        it("should read a JS file", function() {
            var js = new JSModule({
                    file : "./test/specimens/not-module.js"
                });
            
            assert(js._src);
            assert(js._src.length > 0);
            assert(js._src === fs.readFileSync("./test/specimens/not-module.js", "utf8"));
        });
        
        it("should add the module's `path` to a config", function() {
            var js = new JSModule({
                    file : "./test/specimens/not-module.js"
                }),
                config = {
                    properties : [ "fooga" ]
                };

            js._addPath(config);

            assert(config.properties.length === 2);
            assert(config.properties[1] === "fooga");
            assert(config.properties[0].value.value = "not-module.js");
        });
    });
});
