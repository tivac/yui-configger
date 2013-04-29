var test_config = {
    groups: {
        "/": {
            /*
                comment one
            */
            base: "/",
            modules: {
                "module-a": {
                    path: "a.js",
                    requires: ["module-b"]
                },
                "module-c": {
                    path: "c.js"
                }
            }
        },
        "/subfolder/": {
            /* comment two */
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
