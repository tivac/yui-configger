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
        }
    }
};
