/*jshint node:true */
/*global describe, it */

"use strict";

var fs        = require("fs"),
    assert    = require("assert"),
    exec      = require("child_process").exec;

describe("YUI Configger", function() {
    describe("CLI", function() {
        
        it("should return a config string from run (simple)", function(done) {
            exec(
                "node bin/cli.js --root=./test/specimens/simple/",
                function(error, stdout, stderr) {
                    assert.ifError(error);
                    
                    assert.equal(
                        stdout,
                        fs.readFileSync("./test/specimens/simple/_config.js", "utf8")
                    );
                    
                    done();
                }
            );
        });
        
        it("should return a config string from run (group-template)", function(done) {
            exec(
                "node bin/cli.js --root=./test/specimens/group-template/",
                function(error, stdout, stderr) {
                    assert.ifError(error);
                    
                    assert.equal(
                        stdout,
                        fs.readFileSync("./test/specimens/group-template/_config.js", "utf8")
                    );
                    
                    done();
                }
            );
        });
        
        it("should return a config string from run (standard)", function(done) {
            exec(
                "node bin/cli.js --root=./test/specimens/standard/ -q",
                function(error, stdout, stderr) {
                    assert.ifError(error);
                    
                    assert.equal(
                        stdout,
                        fs.readFileSync("./test/specimens/standard/_config.js", "utf8")
                    );
                    
                    done();
                }
            );
        });
        
        it("should bail if no ast can be generated", function(done) {
            exec(
                "node bin/cli.js --root=./test/specimens/empty/",
                function(error, stdout, stderr) {
                    assert(error);
                    
                    done();
                }
            );
        });
    });
});
