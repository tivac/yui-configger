/*jshint node:true */

"use strict";

module.exports = {
    "type": "Property",
    "key": {
        "type": "Identifier",
        "name": "$group"
    },
    "value": {
        "type": "ObjectExpression",
        "properties": [
            {
                "type": "Property",
                "key": {
                    "type": "Identifier",
                    "name": "base"
                },
                "value": {
                    "type": "Literal",
                    "value": "{dir}",
                    "raw": "\"{dir}\""
                },
                "kind": "init"
            },
            {
                "type": "Property",
                "key": {
                    "type": "Identifier",
                    "name": "root"
                },
                "value": {
                    "type": "Literal",
                    "value": "TEST{dir}",
                    "raw": "\"TEST{dir}\""
                },
                "kind": "init"
            }
        ]
    },
    "kind": "init"
};
