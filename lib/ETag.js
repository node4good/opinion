'use strict';
var debug = require('debug')('ETag');
var crc = require('buffer-crc32').signed;
var Stream = require('stream');
var fs = require('co-fs-plus');

module.exports = Etag;

/**
 * Add ETag header field.
 *
 * @return {Function}
 * @api public
 */

function Etag() {
    return function *Etag(next) {
        yield next;

        // no body
        var body = this.body;
        if (!body || this.response.get('ETag')) return;

        // type
        var status = this.status / 100 | 0;
        var type = typeof body;
        var etag;

        // 2xx
        if (2 != status) return;

        // hash
        if (body instanceof Stream) {
            if (!body.path) return;
            try {
                var s = yield fs.stat(body.path);
                etag = crc(s.size + '.' + s.mtime);
            } catch (e) {
                debug("failed to stat %s", body.path);
            }
        } else if ('string' == type || Buffer.isBuffer(body)) {
            etag = crc(body);
        } else {
            etag = crc(JSON.stringify(body));
        }

        // add etag
        if (etag) this.set('ETag', '"' + etag + '"');
    }
}
