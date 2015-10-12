var test_config = {
    groups: {
        "/": {
            base: "/",
            root: "TEST/",
            modules: {
                "module-a": {
                    path: "a.js",
                    requires: ["module-b"]
                }
            }
        },
        "/subfolder/": {
            base: "/subfolder/",
            root: "TEST/subfolder/",
            modules: {
                "module-b": {
                    path: "b.js",
                    requires: ["module-a"]
                }
            }
        },
        "/subfolder/sub-subfolder/": {
            base: "/subfolder/sub-subfolder/",
            root: "TEST/subfolder/sub-subfolder/",
            modules: {
                "module-c": {
                    path: "c.js",
                    requires: ["module-a"]
                }
            }
        },
        "fake-group": {}
    }
};
