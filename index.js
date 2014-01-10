"use strict";
var _ = require('lodash');
var koa = require('koa');
var common = require('./lib/common');


var DEFAULT_MIDDLEWARE_ORDER = {
    NoKeepAlive: common.NoKeepAlive,
    etag: common.etag,
    logger: common.logger,
    statics: common.statics,
    responseTime: common.responseTime,
    compress: common.compress,
    conditionalGet: common.conditionalGet,
    session: common.session,
    csrf: common.csrf,
    render: common.render
};


module.exports = function koa_common(options) {
    var app = _.assign(koa(), options);
    var middlewareOrder = app.middlewareOrder || DEFAULT_MIDDLEWARE_ORDER;
    _(middlewareOrder)
        .map(function (mwSetup, name) {
            var raw = app[name];
            var args = raw && (Array.isArray(raw) ? raw : [raw]);
            return mwSetup.apply(app, args);
        })
        .compact()
        .forEach(function (gen) {
            app.use(gen);
        });
    return app;
};


module.exports.DEFAULT_MIDDLEWARE_ORDER = DEFAULT_MIDDLEWARE_ORDER;
