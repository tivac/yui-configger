/*global YUI:true */
var test_config = {
    groups : {
        root : {
            /* live
            combine   : true,
            comboBase : "/combo/_",
            root      : "/js/",
            //live */

            //* dev
            base : "/js/",
            //dev */

            modules : {
    'module-a': {
        path: 'a.js',
        requires: [
            'view-base',
            'extension-view-classer',
            'extension-view-purchasing',
            'extension-view-tooltips',
            'transform-imagesizer',
            'transform-buttondir',
            'transform-idattribute',
            'gallery-event-visible',
            'gw2-template-items',
            'item-templates',
            'gw2-i18n-gemstore-items'
        ]
    },
    'module-b': {
        path: 'b.js',
        requires: [
            'node',
            'model'
        ]
    },
    'module-c': {
        path: 'c.js',
        requires: [
            'io-base',
            'handlebars-base'
        ]
    },
    'module-d': {
        path: 'd.js'
    }
}
        },

        subfolder : {
            /*aliases : {
                "home" : [
                    "view-home",
                    "page-home"
                ]
            },*/

            modules : {
    'module-e': {
        path: 'e.js',
        requires: [
            'view-base',
            'extension-view-classer',
            'extension-view-purchasing',
            'extension-view-tooltips',
            'transform-imagesizer'
        ]
    },
    'module-f': {
        path: 'f.js',
        requires: [
            'node',
            'modellist',
            'base'
        ]
    }
}
        },

        "subfolder-b" : {
            "modules" : {
    'module-g': {
        path: 'g.js',
        requires: [
            'view-base',
            'extension-view-classer',
            'extension-view-purchasing',
            'extension-view-tooltips',
            'transform-imagesizer'
        ]
    },
    'module-g': {
        path: 'h.js',
        requires: [
            'node',
            'modellist',
            'base'
        ]
    },
    'module-i': {
        path: 'i.js',
        requires: [
            'node',
            'modellist',
            'base'
        ]
    },
    'module-j': {
        path: 'sub-subfolder\\j.js'
    },
    'module-k': {
        path: 'sub-subfolder\\sub-sub-subfolder\\k.js'
    }
}
        }
    }
};
