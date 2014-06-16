"use strict";
var _ = require('lodash-contrib');
var SocketIO = require('socket.io');
var common = require('./common');


OpinionApp.DEFAULT_MIDDLEWARE_STACK = {
    NoKeepAlive: common.NoKeepAlive,
    responseTime: common.responseTime,
    logger: common.logger,
    compress: common.compress,
    conditionalGet: common.conditionalGet,
    etag: common.etag,
    statics: common.statics,
    session: common.session,
    csrf: common.csrf,
    router: common.router
};


function bindSocketIO(app) {
    if (!('socketio' in app)) return;
    app.on('listening', function (server) {
        var serveClient = app.socketio.serveClient || app.socketio.clientPath;
        app.socketio.serveClient = false;
        app.webSockets = app.context.webSockets = new SocketIO(server, app.socketio);
        if (!serveClient) return;
        var clientCode;
        var res = {setHeader: _.noop, writeHead: _.noop, end: function (text) { clientCode = text; }};
        app.webSockets.serve({headers: {}}, res);
        app.router.get(app.socketio.clientPath || '/socket.io.js', function* serve_socket_io_js(next) {
            this.type = 'application/javascript';
            this.body = clientCode;
            yield next;
        });
    });
}


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
}


function OpinionApp(options) {
    var app = new common.Application();
    _.assign(app, options);
    setupMWHandlers(app);
    exposeServer(app);
    bindSocketIO(app);
    extendContext(app);
    return app;
}


module.exports = OpinionApp;
