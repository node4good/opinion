"use strict";
Error.stackTraceLimit = Infinity;
process.chdir(__dirname)
var opinions = require('../..');
var conf = {
    PORT: process.env.PORT || 80
};
var app = opinions({
    middlewareOrder: opinions.DEFAULT_MIDDLEWARE_ORDER,
    keys: ['hell yeah'],
    statics: {
        root: 'assets'
    },
    render: ['views', 'dust']
});


app.use(function* () {
    this.body = yield this.render('hello-world');
});


var server = app.listen(conf.PORT, function () {
    console.log("Server listening on %s", server._connectionKey);
});
