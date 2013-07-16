yui-configger
=============

Utility to extract meta-data from a folder of YUI modules & generate a Loader config object.

[![Build Status](https://travis-ci.org/tivac/yui-configger.png?branch=rethinking-everything)](https://travis-ci.org/tivac/yui-configger)
[![Packages](https://david-dm.org/tivac/yui-configger/status.png)](https://david-dm.org/tivac/yui-configger/)
[![Dev Packages](https://david-dm.org/tivac/yui-configger/dev-status.png)](https://david-dm.org/tivac/yui-configger/)

## Install ##

    npm -g install yui-configger

## Usage ##

    Generate a YUI config.
    Usage: yui-configger -r [dir]
    
    Options:
      --root, -r     Root directory to read YUI modules from                [required]
      --extension    File extension filter (regex)                          [default: "^\\.js$"]
      --filter, -f   File-name filter (regex)                               [default: "."]
      --level, -l    Logging level                                          [default: "warn"]
      --output, -o   Output file for generated config                       [default: stdout]
      --prefix, -p   Prefix for group names                                 [default: ""]
      --tmpl, -t     YUI config file to use as template                     [default: "_config-template.js"]
      --verbose, -v  Chatty output                                          [default: false]


## Development ##

To install from a clone of the source:

    git clone git://github.com/tivac/yui-configger.git
    cd yui-configger
    npm link
