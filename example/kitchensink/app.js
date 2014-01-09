"use strict";
Error.stackTraceLimit = Infinity;
var opinions = require('../..');
var conf = {
    PORT: process.env.PORT || 80
};
var app = opinions({
    middlewareOrder: opinions.DEFAULT_MIDDLEWARE_ORDER,
    keys: ['hell yeah'],
    statics: {
        root: 'assets'
    }
});


app.use(function* () {
    this.body = 'Hello World';
});


var server = app.listen(conf.PORT, function () {
    console.log("Server listening on %s", server._connectionKey);
});
