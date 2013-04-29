var test_config = {
    groups: {
        '/': {
            modules: {
                path : 'a.js',
                requires: ['module-b']
            }
        },
        '/subfolder/': {
            modules: {
                'module-b': {
                    path: 'b.js',
                    requires: ['module-a']
                }
            }
        },
        '/subfolder/sub-subfolder/': {
            modules: {
                'module-c': {
                    path: 'c.js',
                    requires: ['module-a']
                }
            }
        }
    }
};
