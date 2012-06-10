/*global YUI:true */
var test_config = {
    root : "/yui/3.5.0/",
    
    groups : {
        "root" : {
            /* live
            combine   : true,
            comboBase : "/combo/_",
            root      : "/js/",
            //live */
            
            //* dev
            base : "/js/",
            //dev */
            
            modules : "configger"
        },
        
        "gems" : {
            aliases : {
                "home" : [
                    "view-home",
                    "page-home"
                ],
                
                "category" : [
                    "view-category",
                    "page-category"
                ],
                
                "search" : [
                    "view-search",
                    "page-search"
                ],
                
                "sales" : [
                    "view-sales",
                    "page-sales"
                ],
                
                "item-templates" : [
                    "test-template-item",
                    "test-template-item-header",
                    "test-template-item-buttons"
                ]
            },
            
            modules : "configger"
        },
        
        "test-templates" : {
            /* live
            combine   : true,
            comboBase : "/combo/_",
            root      : "/handlebars/test/",
            //live */
            
            //* dev
            // templates like this must ALWAYS go through combo handler, they aren't normal files
            base : "/combo/_/handlebars/test/",
            //dev */
            
            patterns : {
                "test-template" : {
                    configFn : function(me) {
                        me.path = me.name.replace("test-template-", "") + ".handlebars";
                        me.requires = [
                            "handlebars-base",
                            "helper-i18n"
                        ];
                    }
                }
            }
        },
        
        "test-translations" : {
            /* live
            combine   : true,
            comboBase : "/combo/_",
            root      : "/i18n/",
            //live */
            
            //* dev
            // translations must ALWAYS go through combo handler, they aren't normal files
            base : "/combo/_/i18n/",
            //dev */
            
            patterns : {
                "test-i18n" : {
                    configFn : function(me) {
                        var lang = test_config.pageLang;
                        if(!lang) {
                            lang = test_config.pageLang = document.documentElement.lang;
                        }
                        
                        me.path =
                            (me.name.replace("test-i18n-", "GW2/" + lang + "/")
                                    .split("-")
                                    .join("/")) +
                            ".i18n";
                    }
                }
            }
        },
        
        "yui-overrides" : {
             /* live
            combine   : true,
            comboBase : "/combo/_",
            root      : "/js/yui/",
            //live */
            
            //* dev
            base : "/js/yui/",
            //dev */
            
            modules : {
                "app-showview-options" : {
                    path : "app-showview-options.js"
                }
            }
        },
        
        "gallery" : {
            base : "/js/",
            modules : {
                "gallery-event-visible" : {
                    path : "gallery-event-visible.js",
                    requires : ['event-synthetic','event-resize','node','yui-throttle']
                }
            }
        }
    }
};
