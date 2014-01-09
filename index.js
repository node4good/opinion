"use strict";
var _ = require('lodash');
var koa = require('koa');
var common = require('./lib/common');


var DEFAULT_MIDDLEWARE_ORDER = [
    common.NoKeepAlive,
    common.etag,
    common.logger,
    common.statics,
    common.responseTime,
    common.compress,
    common.conditionalGet,
    common.session,
    common.csrf
];


module.exports = function koa_common(options) {
    var app = _.assign(koa(), options);
    var middlewareOrder = app.middlewareOrder || DEFAULT_MIDDLEWARE_ORDER;
    _(middlewareOrder)
        .map(function (mw) {
            return mw.call(app, app[mw.name]);
        })
        .compact()
        .forEach(function (gen) {
            app.use(gen);
        });
    return app;
};


module.exports.DEFAULT_MIDDLEWARE_ORDER = DEFAULT_MIDDLEWARE_ORDER;
