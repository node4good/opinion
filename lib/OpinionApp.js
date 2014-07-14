"use strict";
var common = require('./common');
var util = require('util');
var debug = util.debuglog('opinion');


const mockReq = {
    method: 'GET',
    url: '',
    session: {},
    socket: {},
    headers: {}
};
const mockRes = {
    once: _.noop,
    setHeader: _.noop,
    getHeader: _.noop,
    end: function (msg) {
        this.writable = false;
        if (this.statusCode < 400) return;
        console.log('###\nmock request ended - code: %d - msg: %s\n###', this.statusCode, msg);
        throw new Error(msg);
    }
};


function OpinionApp(options) {
    if (!(this instanceof OpinionApp)) return new OpinionApp(options);
    OpinionApp.super_.call(this);
    _.assign(this, options);
    setupMWHandlers(this);
    exposeServer(this);
    extendContext(this);
}
util.inherits(OpinionApp, common.Application);

OpinionApp.DEFAULT_MIDDLEWARE_STACK = {
    cls: common.cls,
    socketio: common.SocketIO,
    logger: common.logger,
    responseTime: common.responseTime,
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
        if (handler && !handler.name)
            handler._name = name;
        if (handler) app.use(handler);
    });
}


function extendContext(app) {
    app.context.render = common.render.apply(app, app.render);
    app.context.send = function (path, opts) {
        return common.send(this, path, opts);
    };
    app.mock = function (req, res) {
        var cb = [].pop.call(arguments);
        if (typeof cb !== 'function') {
            if (arguments.length === 0) req = cb;
            if (arguments.length === 1) res = cb;
            cb = undefined;
        } else {
            if (arguments.length === 0) req = null;
            if (arguments.length === 1) res = null;
        }
        var end;
        if (cb) end = function (msg) {
            cb(this.statusCode > 404 ? new Error(this.statusCode + msg) : null);
        };
        Object.defineProperty(this.context, 'writable', {value: true});
        var handle = app.callback();
        this.respond = false;
        handle(_.defaults({}, req, mockReq), _.defaults({end: end}, res, mockRes));
    };
    app.use = function (fn) {
        if ('GeneratorFunction' == fn.constructor.name) {
            debug('use %s', fn._name || fn.name || '-');
            this.middleware.push(fn);
            return this;
        } else if ('function' == typeof fn && 3 == fn.length) {
            var fnWrap = function* (next) {
                yield (common.thunkify(fn)(this.req, this.res));
                yield next;

            };
            this.middleware.push(fnWrap);
            return this;
        }
    };
    app.onerror = function (err) {
        if (404 == err.status) return;
        if ('test' == this.env) return;

        var msg = err.stack || err.toString();
        console.log();
        console.log(msg.replace(/^/gm, '  '));
        console.log();
    };
    app.mountExpress = function mountExpress(mount_path, mount_app) {
        debug('.use app under %s', mount_path);
        mount_app.mountpath = mount_path;
        mount_app.parent = this;

        var route = new RegExp(mount_path + '(/.*)');
        app.router.all(route, function* mounted_app() {
            var req = this.req;
            var res = this.res;
            req.url = this.params[0];
            res.statusCode = 200;
            mount_app.handle(req, res);
            this.respond = false;
        });

        return this;
    };
}


module.exports = OpinionApp;
