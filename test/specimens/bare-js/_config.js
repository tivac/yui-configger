var test_config = {
        groups: {
            "/": {
                base: "/",
                modules: {
                    "_config": { path: "_config.js" },
                    "module-a": {
                        path: "a.js",
                        requires: ["module-b"]
                    },
                    "external": { path: "external.js" }
                }
            }
        }
    };
