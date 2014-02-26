/*jshint node:true */
"use strict";

var fs     = require("fs"),
    assert = require("assert"),
    
    BaseModule = require("../lib/modules/base");

describe("yui-configger", function() {
    describe.only("Base Module Class", function() {
        it("should instantiate", function() {
            new BaseModule({
                file : "./test/specimens/simple/a.js"
            });
        });
        
        it("should require file be specified", function() {
            assert.throws(function() {
                new BaseModule();
            });

            assert.doesNotThrow(function() {
                new BaseModule({
                    file : "./test/specimens/simple/a.js"
                });
            });
        });

        it("should read the specified file", function() {
            var file = "./test/specimens/simple/a.js",
                base = new BaseModule({
                    file : file
                });
            
            assert(base._src);
            assert(base._src.length > 0);
            assert(base._src === fs.readFileSync(file, "utf8"));
        });

        it("should provide getters for simple values", function() {
            var base = new BaseModule({
                    file : "./test/specimens/simple/a.js",
                    name : "base-a"
                });
            
            assert.equal(base.file, "./test/specimens/simple/a.js");
            assert.equal(base.name, "base-a");

            assert.throws(function() {
                base.config;
            });

            base._config = "fooga";

            assert(base.config === "fooga");
        });

        it("should provide a `valid` function to check validity", function() {
            var base = new BaseModule({
                    file : "./test/specimens/simple/a.js"
                });

            assert(base.valid());
        });

        it("should add the module's `path` to a config", function() {
            var base = new BaseModule({
                    file : "./test/specimens/simple/a.js"
                }),
                config = {
                    properties : [ "fooga" ]
                };

            base._addPath(config);

            assert(config.properties.length === 2);
            assert(config.properties[1] === "fooga");
            assert(config.properties[0].value.value = "a.js");
        });
    });
});
