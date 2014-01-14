/*jshint node:true */
/*global describe, it */

"use strict";

var fs        = require("fs"),
    nixt      = require("nixt"),
    options   = {
        newlines : true
    },
    base      = "node bin/cli.js ";

describe("yui-configger", function() {
    describe("CLI", function() {
        
        it("should return a config string from run (simple)", function(done) {
            nixt(options)
                .base(base)
                .run("--root=./test/specimens/simple/ --silent ./test/specimens/simple/")
                .code(0)
                .stdout(fs.readFileSync("./test/specimens/simple/_config.js", "utf8"))
                .end(done);
        });

        it("should return a config string from run (group-template)", function(done) {
            nixt(options)
                .base(base)
                .run("--root=./test/specimens/group-template/ --silent ./test/specimens/group-template/")
                .code(0)
                .stdout(fs.readFileSync("./test/specimens/group-template/_config.js", "utf8"))
                .end(done);
        });
        
        it("should return a config string from run (standard)", function(done) {
            nixt(options)
                .base(base)
                .run("--root=./test/specimens/standard/ --silent ./test/specimens/standard/")
                .code(0)
                .stdout(fs.readFileSync("./test/specimens/standard/_config.js", "utf8"))
                .end(done);
        });

        it("should return a config string from run (mixed, no css)", function(done) {
            nixt(options)
                .base(base)
                .run("--root=./test/specimens/mixed/ --silent ./test/specimens/mixed/")
                .code(0)
                .stdout(fs.readFileSync("./test/specimens/mixed/js/_config.js", "utf8"))
                .end(done);
        });

        it("should return a config string from run (mixed, css)", function(done) {
            nixt(options)
                .base(base)
                .run("--root=./test/specimens/mixed/ --css --silent ./test/specimens/mixed/")
                .code(0)
                .stdout(fs.readFileSync("./test/specimens/mixed/js/_config-css.js", "utf8"))
                .end(done);
        });
        
        it("should bail if no ast can be generated", function(done) {
            nixt(options)
                .base(base)
                .run("--root=./test/specimens/empty/ --silent ./test/specimens/empty")
                .code(1)
                .end(done);
        });
    });
});
