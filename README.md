yui-configger
=============
[![Build Status](https://travis-ci.org/tivac/yui-configger.png?branch=master)](https://travis-ci.org/tivac/yui-configger)
[![NPM version](https://badge.fury.io/js/yui-configger.png)](http://badge.fury.io/js/yui-configger)
[![Dependency Status](https://david-dm.org/tivac/yui-configger.png?theme=shields.io)](https://david-dm.org/tivac/yui-configger)
[![devDependency Status](https://david-dm.org/tivac/yui-configger/dev-status.png?theme=shields.io)](https://david-dm.org/tivac/yui-configger#info=devDependencies)

Extract meta-data from a folder of YUI modules & generate a Loader config object. Writing out a config file by hand sucks, so let's automate the process!

## Example ##

Let's say you have a folder of YUI modules, something like

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

Where each module looks something like

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

`configger -root=/app` will generate a config with a structure like

```javascript
var config = {
    groups : {
        "main" : {
            base : "/main",
            modules : {
                "a" : {
                    path : "a.js",
                    requires : [
                        "event",
                        "io"
                    ]
                },
                "b" : { ... },
                "c" : { ... }
            }
        },
        "shared" : { ... },
        "test" : { ... }
    }
};
```

You can also optionally provide a list of search dirs to look for modules in, all paths will be relative to the `root` value. This pairs well with the `--css` flag, which will generate minimal metadata to allow the YUI Loader to load css files as modules for you.

So running `configger --css --root=/app /app/js /app/css` on directories laid out like

```
/app
|-- js
|   |-- main
|   |   |-- a.js
|   |   |-- b.js
|   |   `-- c.js
|   |
|   |-- shared
|   |   |-- d.js
|   |   |-- e.js
|   |   `-- f.js
|   |
|   `-- _config-template.js
|
`-- css
    |-- a.js
    `-- b.js
```

will generate this config structure

```javascript
var config = {
    groups : {
        "/js/main" : {
            base : "/js/main",
            modules : {
                "a" : { ... },
                "b" : { ... },
                "c" : { ... }
            }
        },

        "/js/shared" : { ... },

        "/css" : {
            base : "/css",
            modules : {
                "css-a" : {
                    type : "css",
                    path : "a.css"
                },
                "css-b" : { ... }
            }
        }
    }
};
```

## Install ##

    npm -g install yui-configger

## Usage ##

### CLI ###

    Generate a YUI config.
    Usage: node C:\Users\pcavit\Documents\GitHub\yui-configger\bin\cli.js --root=[dir] [dir],..,[dirN]

    Options:
      --root, -r        Root path that files will be loaded relative to        [required]
      --extensions, -e  File extensions to parse & include in config           [default: "js,css"]
      --filter, -f      File-name filter (regex)                               [string]  [default: "."]
      --output, -o      Output file for generated config (defaults to stdout)
      --prefix, -p      Prefix for group names                                 [default: ""]
      --tmpl, -t        YUI config file template                               [default: "_config-template.js"]
      --css             Generate config values for CSS modules                 [default: false]
      --cssprefix       CSS module prefix                                      [default: "css-"]
      --verbose                                                                [default: false]
      --silent                                                                 [default: false]
      --loglevel                                                               [default: "info"]

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
