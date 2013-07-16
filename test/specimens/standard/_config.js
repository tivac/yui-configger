var test_config = {
        groups: {
            "/": {
                comboBase: "/combo/_",
                root: "/",
                base: "/",
                modules: {
                    "module-a": {
                        path: "a.js",
                        requires: [
                            "view-base",
                            "extension-view-classer",
                            "extension-view-purchasing",
                            "extension-view-tooltips",
                            "transform-imagesizer",
                            "transform-buttondir",
                            "transform-idattribute",
                            "gallery-event-visible",
                            "gw2-template-items",
                            "item-templates",
                            "gw2-i18n-gemstore-items"
                        ]
                    },
                    "module-b": {
                        path: "b.js",
                        requires: [
                            "node",
                            "model"
                        ]
                    },
                    "module-c": {
                        path: "c.js",
                        requires: [
                            "io-base",
                            "handlebars-base"
                        ]
                    },
                    "module-d": { path: "d.js" }
                }
            },
            "test-root": {
                base: "/js/",
                modules: "configger"
            },
            "/subfolder/": {
                aliases: {
                    "home": [
                        "view-home",
                        "page-home"
                    ]
                },
                modules: {
                    "module-e": {
                        path: "e.js",
                        requires: [
                            "view-base",
                            "extension-view-classer",
                            "extension-view-purchasing",
                            "extension-view-tooltips",
                            "transform-imagesizer"
                        ]
                    },
                    "module-f": {
                        path: "f.js",
                        requires: [
                            "node",
                            "modellist",
                            "base"
                        ]
                    }
                }
            },
            "/subfolder-b/": {
                modules: {
                    "module-g": {
                        path: "g.js",
                        requires: [
                            "view-base",
                            "extension-view-classer",
                            "extension-view-purchasing",
                            "extension-view-tooltips",
                            "transform-imagesizer"
                        ]
                    },
                    "module-g": {
                        path: "h.js",
                        requires: [
                            "node",
                            "modellist",
                            "base"
                        ]
                    },
                    "module-i": {
                        path: "i.js",
                        requires: [
                            "node",
                            "modellist",
                            "base"
                        ]
                    }
                }
            },
            "test-subfolder": { modules: "configger" },
            "/subfolder-b/sub-subfolder/": {
                base: "/subfolder-b/sub-subfolder/",
                modules: { "module-j": { path: "j.js" } }
            },
            "/subfolder-b/sub-subfolder/sub-sub-subfolder/": {
                base: "/subfolder-b/sub-subfolder/sub-sub-subfolder/",
                modules: { "module-k": { path: "k.js" } }
            }
        }
    };
