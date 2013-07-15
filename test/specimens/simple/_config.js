var test_config = {
        groups: {
            "/": {
                base: "/",
                modules: {
                    "module-a": {
                        path: "a.js",
                        requires: ["module-b"]
                    },
                    "module-c": { path: "c.js" }
                }
            },
            "/subfolder/": {
                base: "/subfolder/",
                modules: {
                    "module-b": {
                        path: "b.js",
                        requires: ["module-a"]
                    }
                }
            }
        }
    };
