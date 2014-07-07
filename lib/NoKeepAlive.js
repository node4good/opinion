/**
 * Expose `NoKeepAlive()`.
 */

module.exports = NoKeepAlive;

/**
 * Tells `http` and the client that we want to close the connection.
 *
 * @return {Function}
 * @api public
 */

function NoKeepAlive(options) {
    options = options || this;
    if (options.env !== 'development') return null;

    return function *NoKeepAlive(next){
        this.set("Connection", "close");
        this.res.shouldKeepAlive = false;
        return yield* next;
    };
}
