var test_config = {
        groups: {
            "/": {
                base: "/",
                modules: {
                    "module-a": {
                        path: "a.js",
                        requires: [
                            "module-b",
                            "fooga"
                        ]
                    },
                    "module-b": { path: "b.js" },
                    "fooga": {
                        path: "c.css",
                        type: "css"
                    }
                }
            }
        }
    };
