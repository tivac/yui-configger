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
                    "gw2-template-item",
                    "gw2-template-item-header",
                    "gw2-template-item-buttons"
                ]
            },
            
            modules : "configger"
        },
        
        "gemstore-templates" : {
            /* live
            combine   : true,
            comboBase : "/combo/_",
            root      : "/handlebars/GW2/",
            //live */
            
            //* dev
            // templates like this must ALWAYS go through combo handler, they aren't normal files
            base : "/combo/_/handlebars/GW2/",
            //dev */
            
            patterns : {
                "gw2-template" : {
                    configFn : function(me) {
                        me.path = me.name.replace("gw2-template-", "") + ".handlebars";
                        me.requires = [
                            "handlebars-base",
                            "helper-i18n"
                        ];
                    }
                }
            }
        },
        
        "gemstore-translations" : {
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
                "gw2-i18n" : {
                    configFn : function(me) {
                        var lang = test_config.pageLang;
                        if(!lang) {
                            lang = test_config.pageLang = document.documentElement.lang;
                        }
                        
                        me.path =
                            (me.name.replace("gw2-i18n-", "GW2/" + lang + "/")
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
