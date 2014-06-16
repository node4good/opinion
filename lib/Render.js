"use strict";
var debug = require('debug')('Render');
var _ = require('lodash-contrib');
var path = require('path');
var thunkify = require('thunkify');
var consolidate = require('consolidate');
consolidate.html = require('fs').readFile;

var extname = path.extname;
var join = path.join;
var resolve = path.resolve;
var env = process.env.NODE_ENV || 'development';
var engines = _.mapValues(consolidate, function (engine) {
    if (Object.getPrototypeOf(engine).name === 'GeneratorFunctionPrototype') return engine;
    return thunkify(engine);
});


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
 * @param {String} defaultPath
 * @param {String} defaultExt (optional)
 * @param {Object} opts (optional)
 * @return {Function} middleware
 * @api public
 */
module.exports = function (defaultPath, defaultExt, opts) {
    defaultPath = defaultPath || 'views';
    opts = opts || {};
    if (typeof defaultExt === 'object') opts = defaultExt;
    else opts.ext = defaultExt || 'html';

    opts.encoding = opts.encoding || 'utf-8';
    opts.settings = opts.settings || {};
    opts.settings.views = opts.settings.views || resolve(defaultPath);
    opts.map = opts.map || {};
    // `consolidate` wants to know if it should cache compiled templates
    opts.cache = ('cache' in opts) ? opts.cache : ('development' != env);

    debug('default params dir="%s" opts=%j', defaultPath, opts);

    return function* (viewname, locals) {
        // merge global, context, and direct locals.
        locals = _.assign({}, locals, this.locals);
        var args = _.assign({locals: locals}, opts);

        // default extname
        var ext = extname(viewname).substr(1);
        if (!ext) {
            viewname += '.' + opts.ext;
            ext = opts.ext;
        }

        // map engine
        var engineName = opts.map[ext] || ext;
        var engine = engines[engineName];

        // resolve
        var viewPath = join(defaultPath, viewname);

        debug('rendering `%s` with engine `%s` - locals: %j', viewPath, engineName, args);
        this.body = yield engine(viewPath, args);
        debug('rendered `%s` with engine `%s`', viewPath, engineName);
    }
};
