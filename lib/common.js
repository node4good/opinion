// Vanilla
exports.co = require('co');
exports.Application = require('koa');
exports.conditionalGet = require('koa-conditional-get');
exports.responseTime = require('koa-response-time');
exports.compress = require('koa-compress');
exports.rewrite = require('koa-rewrite');
exports.favicon = require('koa-favicon');
exports.logger = require('koa-logger');
exports.etag = require('koa-etag');
exports.session = require('koa-session');
exports.send = require('koa-send');

// Adapted
exports.statics = function statics(root, opts) { return require('koa-static')(root, opts) };
exports.csrf = function csrf(opts) { require('koa-csrf')(this, opts); return null; };
exports.router = function router() { this.router = new (require('koa-router'))(this); return this.router.middleware(); };

// Own
exports.NoKeepAlive = require('./NoKeepAlive');
exports.render =  require('./Render');
