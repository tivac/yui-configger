yui-configger
=============
[![Build Status](https://travis-ci.org/tivac/yui-configger.png?branch=master)](https://travis-ci.org/tivac/yui-configger)
[![NPM version](https://badge.fury.io/js/yui-configger.png)](http://badge.fury.io/js/yui-configger)
[![Dependency Status](https://david-dm.org/tivac/yui-configger.png?theme=shields.io)](https://david-dm.org/tivac/yui-configger)
[![devDependency Status](https://david-dm.org/tivac/yui-configger/dev-status.png?theme=shields.io)](https://david-dm.org/tivac/yui-configger#info=devDependencies)

Extract meta-data from a folder of YUI modules/CSS files & generate a Loader config object. Writing out a config file by hand sucks, so let's automate the process!

## Example ##

Let's say you have a folder of files (mostly YUI modules), something like

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

Running `configger` in the `/app` dir will generate this config:

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

will generate this config

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
    Usage: yui-configger --root=[dir] [dir],..,[dirN]

    Options:
      --cssextensions  CSS file extensions (comma-separated)                  [default: "css"]
      --css, -f        Generate config values for CSS modules                 [default: false]
      --filter, -f     File-name filter (glob)                                [string]  [default: undefined]
      --jsextensions   JavaScript file extensions (comma-separated)           [default: "js"]
      --output, -o     Output file for generated config (defaults to stdout)
      --prefix, -p     Prefix for group names                                 [default: ""]
      --root, -r       Root path that files will be loaded relative to        [default: "."]
      --tmpl, -t       YUI config file template                               [default: "**/_config-template.js"]
      --verbose, -v                                                           [default: false]
      --silent                                                                [default: false]
      --loglevel                                                              [default: "info"]

### Programmatic ###

```javascript
var Configger = require("configger"),
    configger = new Configer({
        root : "."
    }),
    config;

config = configger.run();
```

From the programmatic API you may also define a `nameFn` that will be invoked to determine the name of all non-YUI modules. The default `nameFn` will do the following for CSS files.

`fooga.css` will have a module name of `css-fooga`.

The default implementation provides a good overview of the arguments passed.

```javascript
// Default naming function for modules
_nameFn : function(file, type) {
    var name = path.basename(file, path.extname(file));

    if(type !== "css") {
        return name;
    }

    return "css-" + name;
},
```

## Development ##

To install from a clone of the source:

    git clone git://github.com/tivac/yui-configger.git
    cd yui-configger
    npm link
