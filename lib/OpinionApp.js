"use strict";
var _ = require('lodash-contrib');
var common = require('./common');


const mockReq = {url: '', session: {}};
const mockRes = {setHeader: function () {}, getHeader: function () {}};


function OpinionApp(options) {
    var app = new common.Application();
    _.assign(app, options);
    setupMWHandlers(app);
    exposeServer(app);
    extendContext(app);
    return app;
}


OpinionApp.DEFAULT_MIDDLEWARE_STACK = {
    cls: common.cls,
    NoKeepAlive: common.NoKeepAlive,
    responseTime: common.responseTime,
    logger: common.logger,
    socketio: common.SocketIO,
    compress: common.compress,
    conditionalGet: common.conditionalGet,
    etag: common.etag,
    statics: common.statics,
    session: common.session,
    csrf: common.csrf,
    router: common.router
};


function exposeServer(app) {
    app.listen = _.wrap(app.listen, function (func) {
        var args = [].slice.call(arguments, 1);
        var cb = args.pop();
        args.push(function listeningCallback() {
            app.theServer = this;
            app.emit('listening', this);
            if (typeof cb === 'function') cb.apply(this, arguments);
        });
        return func.apply(app, args);
    });
}


function setupMWHandlers(app) {
    var stack = app.middlewareOrder || OpinionApp.DEFAULT_MIDDLEWARE_STACK;
    _(stack).forEach(function (mwSetup, name) {
        var rawArgs = app[name];
        var args = rawArgs && (Array.isArray(rawArgs) ? rawArgs : [rawArgs]);
        var handler = mwSetup.apply(app, args);
        if (handler) app.use(handler);
    });
}


function extendContext(app) {
    app.context.render = common.render.apply(app, app.render);
    app.context.send = function (path, opts) { return common.send(this, path, opts); };
    app.mock = function (req, res) { app.callback()(_.assign({}, mockReq, req), _.assign({}, mockRes, res)); };
}


module.exports = OpinionApp;
