"use strict";
var _ = require('lodash');
var koa = require('koa');
var router = require('koa-router');
var socketio = require('socket.io');
var common = require('./common');


var DEFAULT_MIDDLEWARE_STACK = {
    NoKeepAlive: common.NoKeepAlive,
    responseTime: common.responseTime,
    logger: common.logger,
    compress: common.compress,
    conditionalGet: common.conditionalGet,
    etag: common.etag,
    statics: common.statics,
    session: common.session,
    csrf: common.csrf,
    render: common.render
};


module.exports = function koa_common(options) {
    var app = _.assign(koa(), options);
    var middlewareOrder = app.middlewareOrder || DEFAULT_MIDDLEWARE_STACK;
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
    app.use(router(app));
    if ('socketio' in options) {
        app.socketio = new socketio(options.socketio);
        app.listen = _.wrap(app.listen, function (func) {
            var args = [].slice.call(arguments, 1);
            var cb = args.pop();
            args.push(function () {
                app.socketio.attach(this);
                if (cb && cb.apply) cb.apply(this);
            });
            return func.apply(app, args);
        });
    }
    return app;
};


module.exports.DEFAULT_MIDDLEWARE_STACK = DEFAULT_MIDDLEWARE_STACK;
