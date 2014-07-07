"use strict";
// Vanilla
global._ = require('lodash-contrib');
global.co = require('co');
global.Chanel = require('chanel');
global.thunkify = require('thunkify');

exports.Application = require('koa');
exports.thunkify = require('thunkify');
exports.conditionalGet = require('koa-conditional-get');
exports.responseTime = require('koa-response-time');
exports.compress = require('koa-compress');
exports.rewrite = require('koa-rewrite');
exports.favicon = require('koa-favicon');
exports.logger = require('koa-logger');
exports.etag = require('koa-etag');
exports.session = require('koa-session');
exports.send = require('koa-send');
exports.cls2 = require('cls2');

// Adapted
exports.statics = function statics(root, opts) { root = root || 'assets'; return require('koa-static')(root, opts); };
exports.csrf = function csrf(opts) { require('koa-csrf')(this, opts); return null; };
exports.router = function router() { this.router = new (require('koa-router'))(this); return this.router.middleware(); };
exports.cls = function cls(clsName, ctxName) {
    if (arguments.length > 0 && !clsName) return;
    clsName = clsName || 'opinionCLS';
    ctxName = ctxName || 'webContext';
    var ns = global[clsName] = exports.cls2.getNamespace(clsName) || exports.cls2.createNamespace(clsName);
    return function* clsPopulate(next) {
        var clsctx = ns.createContext();
        ns.enter(clsctx);
        clsctx[ctxName] = this;
        try {
            yield next;
        }
        catch (exception) {
            exception['error@context'] = clsctx;
            throw exception;
        }
        finally {
            ns._active && ns.exit(clsctx);
        }
    };
};

// Own
exports.NoKeepAlive = require('./NoKeepAlive');
exports.render =  require('./Render');
exports.SocketIO = require('./SocketIO');
