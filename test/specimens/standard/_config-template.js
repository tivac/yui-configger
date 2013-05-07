/*exported test_config */
var test_config = {
    groups : {
        "/" : {
            /* live
            combine   : true,
            */
            
            comboBase : "/combo/_",
            root      : "/js/",
            base      : "/js/"
        },

        "test-root" : {
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

        "/subfolder/" : {
            aliases : {
                "home" : [
                    "view-home",
                    "page-home"
                ]
            },

            modules : "configger"
        },

        "/subfolder-b/" : {
            "modules" : "configger"
        },

        "test-subfolder" : {
            modules : "configger"
        }
    }
};
