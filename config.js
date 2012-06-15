module.exports = {
    root : {
        demand : true,
        alias : 'r',
        description : "Root directory to read YUI modules from"
    },
    tmpl : {
        alias : 't',
        description :
            "YUI config file to use as template,\n" +
            "\t\twill use _config.js in Root if not specified"
    },
    output : {
        alias : "o",
        description : "Output file for generated config (defaults to stdout)"
    },
    filter : {
        alias : "f",
        description : "File-name filter (regex)"
    }
};
