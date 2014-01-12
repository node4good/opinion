// Vanilla
exports.conditionalGet = require('koa-conditional-get');
exports.responseTime = require('koa-response-time');
exports.ratelimit = require('koa-ratelimit');
exports.compress = require('koa-compress');
exports.rewrite = require('koa-rewrite');
exports.favicon = require('koa-favicon');
exports.logger = require('koa-logger');
exports.mount = require('koa-mount');
exports.etag = require('koa-etag');
exports.session = require('koa-session');
exports.serve =  require('koa-static');
exports.route =  require('koa-route');
exports.render =  require('./Render');
// Adapted
exports.statics = function statics(opts) { return exports.serve(opts.root, opts) };
exports.csrf = function csrf(opts) {  require('koa-csrf')(this, opts); return null; };
// Own
exports.NoKeepAlive = require('./NoKeepAlive');