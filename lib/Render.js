"use strict";
var debug = require('debug')('Render');
var _ = require('lodash');
var path = require('path');
var extname = path.extname;
var join = path.join;
var resolve = path.resolve;
var cons = require('consolidate');

/**
 * Environment.
 */

var env = process.env.NODE_ENV || 'development';


/**
 * Add a render() method to koa that allows
 * you to render almost any templating engine.
 *
 * Example:
 *
 *   app.use(views('./example', {
 *     html: 'underscore'
 *   }));
 *
 *   // in your route handler
 *   this.body = yield this.render('index');
 *
 * @param {String} path
 * @param {String} ext (optional)
 * @param {Object} opts (optional)
 * @return {Function} middleware
 * @api public
 */

module.exports = function (path, ext, opts) {
    opts = opts || {};

    if (typeof ext === 'object') opts = ext;
    else opts.ext = ext;

    debug('register `Render` middleware: dir="%s" ext="%s" opts=%j', path, ext, opts);

    // get render function
    var renderFunc = (function render(path, opts) {
        if (!opts.locals) return view(path, opts);

        return function (file, locals) {
            // merge global with local locals.
            locals = _.defaults(locals, opts.locals);

            debug('render %s with locals %j and options %j', file, locals, opts);
            return view(path, opts)(file, locals);
        }
    })(path, opts);

    // middleware
    return function *views(next) {
        debug('add `render` method to `this.ctx` - url="%s"', this.url);
        this.render = renderFunc;
        yield next;
    }
};


/**
 * Pass views `dir` and `opts` to return
 * a render function.
 *
 *  - `map` an object mapping extnames to engine names [{}]
 *  - `ext` default extname to use when missing [html]
 *  - `cache` cached compiled functions [NODE_ENV != 'development']
 *
 * @param {String} [dir]
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */

function view(dir, opts) {
    opts = opts || {};

    debug('views: dir="%s" opts=%j', dir, opts);

    // view directory
    dir = dir || 'views';
    opts.settings = opts.settings || {};
    opts.settings.views = opts.settings.views || resolve(dir);

    // default extname
    var ext = opts.ext || 'html';

    // engine map
    var map = opts.map || {};

    // cache compiled templates
    var cache = opts.cache;
    if (null == cache) cache = 'development' != env;

    return function (view, locals) {
        locals = locals || {};

        // default extname
        var e = extname(view).slice(1);

        if (!e) {
            view += '.' + ext;
            e = ext;
        }

        // map engine
        var engine = cons[map[e] || e];

        // resolve
        view = join(dir, view);

        // cache
        locals.cache = cache;

        debug('render %s %j', view, locals);

        return function (done) {
            debug('render %s with %j', view, opts);
            engine(view, opts, done);
        }
    };
}
