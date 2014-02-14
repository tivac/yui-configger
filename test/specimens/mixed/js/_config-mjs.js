var test_config = {
        groups: {
            "/js/templates/": {
                base: "/js/templates/",
                modules: {
                    "template-a": { path: "a.mjs" },
                    "template-b": {
                        path: "b.mjs",
                        requires: ["template-a"]
                    }
                }
            }
        }
    };
