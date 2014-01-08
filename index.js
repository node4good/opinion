"use strict";
var common = require('./lib');
var koa = require('koa');
var _ = require('lodash');


var DEFAULT_MIDDLEWARE_ORDER = [
    common.NoKeepAlive,
    common.etag,
    common.logger,
    common.responseTime,
    common.compress,
    common.conditionalGet,
    common.session,
    common.csrf
];


module.exports = function koa_common(options) {
    var app = koa();
    _.assign(app, options);
    var middlewareOrder = app.middlewareOrder || DEFAULT_MIDDLEWARE_ORDER;
    _(middlewareOrder)
        .map(function (mw) {
            return mw.apply(app);
        })
        .compact()
        .forEach(function (gen) {
            app.use(gen);
        });
    return app;
};


module.exports.DEFAULT_MIDDLEWARE_ORDER = DEFAULT_MIDDLEWARE_ORDER;
