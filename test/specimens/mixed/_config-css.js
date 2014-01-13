var test_config = {
        groups: {
            "/css/": {
                base: "/css/",
                modules: {
                    "css-a": {
                        path: "a.css",
                        type: "css"
                    }
                }
            },
            "/css/subfolder/": {
                base: "/css/subfolder/",
                modules: {
                    "css-b": {
                        path: "b.css",
                        type: "css"
                    }
                }
            },
            "/js/": {
                base: "/js/",
                modules: {
                    "module-a": {
                        path: "a.js",
                        requires: ["module-b"]
                    },
                    "module-c": { path: "c.js" }
                }
            },
            "/js/subfolder/": {
                base: "/js/subfolder/",
                modules: {
                    "module-b": {
                        path: "b.js",
                        requires: ["module-a"]
                    }
                }
            }
        }
    };
