/*jshint node:true */
/*global describe, it */

"use strict";

var fs        = require("fs"),
    nixt      = require("nixt"),
    base      = "node bin/cli.js ",
    options   = {
        newlines : true
    },
    _file;

_file = function(file) {
    return fs.readFileSync(file, "utf8").replace(/\r?\n$/, "");
};

describe("yui-configger", function() {
    describe("CLI", function() {
        
        it("should return a config string from run (simple)", function(done) {
            nixt(options)
                .base(base)
                .run("--root=./test/specimens/simple/ --silent ./test/specimens/simple/")
                .code(0)
                .stdout(_file("./test/specimens/simple/_config.js"))
                .end(done);
        });

        it("should return a config string from run (group-template)", function(done) {
            nixt(options)
                .base(base)
                .run("--root=./test/specimens/group-template/ --silent ./test/specimens/group-template/")
                .code(0)
                .stdout(_file("./test/specimens/group-template/_config.js"))
                .end(done);
        });
        
        it("should return a config string from run (standard)", function(done) {
            nixt(options)
                .base(base)
                .run("--root=./test/specimens/standard/ --silent ./test/specimens/standard/")
                .code(0)
                .stdout(_file("./test/specimens/standard/_config.js"))
                .end(done);
        });

        it("should return a config string from run (mixed, no css)", function(done) {
            nixt(options)
                .base(base)
                .run("--root=./test/specimens/mixed/ --silent ./test/specimens/mixed/")
                .code(0)
                .stdout(_file("./test/specimens/mixed/js/_config.js"))
                .end(done);
        });

        it("should return a config string from run (mixed, css)", function(done) {
            nixt(options)
                .base(base)
                .run("--root=./test/specimens/mixed/ --css --silent ./test/specimens/mixed/")
                .code(0)
                .stdout(_file("./test/specimens/mixed/js/_config-css.js"))
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
