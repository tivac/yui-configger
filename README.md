yui-configger
=============
[![Build Status](https://travis-ci.org/tivac/yui-configger.png?branch=master)](https://travis-ci.org/tivac/yui-configger)
[![NPM version](https://badge.fury.io/js/yui-configger.png)](http://badge.fury.io/js/yui-configger)
[![Dependency Status](https://david-dm.org/tivac/yui-configger.png?theme=shields.io)](https://david-dm.org/tivac/yui-configger)
[![devDependency Status](https://david-dm.org/tivac/yui-configger/dev-status.png?theme=shields.io)](https://david-dm.org/tivac/yui-configger#info=devDependencies)

Extract meta-data from a folder of YUI modules & generate a Loader config object. Writing out a config file by hand sucks, so let's automate the process!

## Example ##

Let's say you have a folder of YUI modules, looking something like this:

```
/app
|-- main
|   |-- a.js
|   |-- b.js
|   `-- c.js
|
|-- shared
|   |-- d.js
|   |-- e.js
|   `-- f.js
|
|-- test
|   |-- g.js
|   `-- h.js
|
`-- _config-template.js
```

Where each module looks something like this:

```javascript
YUI.add("a.js", function(Y) {
    ...
}, "@VERSION@", {
    requires : [
        "event",
        "io"
    ]
});
```

Running `configger -r /app` will generate a config with a structure like the following

```javascript
var config = {
    groups : {
        "main" : {
            base : "/app/main",
            modules : {
                "a" : {
                    path : "a.js",
                    requires : [
                        "event",
                        "io"
                    ]
                },

                "b" : {
                    ...
                },

                "c" : {
                    ...
                }
            }
        },

        "shared" : {
            ...
        },

        "test" : {
            ...
        }
    }
};
```

## Install ##

    npm -g install yui-configger

## Usage ##

### CLI ###

    Generate a YUI config.
    Usage: yui-configger -r [dir]
    
    Options:
      --root,   -r   Root directory to read YUI modules from                [required]
      --filter, -f   File-name filter (regex)                               [default: "."]
      --output, -o   Output file for generated config                       [default: stdout]
      --prefix, -p   Prefix for group names                                 [default: ""]
      --tmpl,   -t   YUI config file template                               [default: "_config-template.js"]
      --extension    File extension filter (regex)                          [default: "^\\.js$"]
      --loglevel                                                            [default: "info"]
      --verbose                                                             [default: false]
      --silent                                                              [default: false]

### Programmatic ###

```javascript
var Configger = require("configger"),
    configger = new Configer({
        root : "."
    }),
    config;

config = configger.run();
```

## Development ##

To install from a clone of the source:

    git clone git://github.com/tivac/yui-configger.git
    cd yui-configger
    npm link
