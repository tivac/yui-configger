var test_config = {
    groups: {
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
        },
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
        }
    }
};
