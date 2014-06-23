"use strict";
var _ = require('lodash-contrib');
var SocketIO = require('socket.io');
var internalEngineIO = require('socket.io/node_modules/engine.io');
var debug = require('debug')('opinion');


var handleReq;
function patchedAttach(server, options){
    var self = this;
    options = options || {};
    var path = (options.path || '/engine.io').replace(/\/$/, '');

    var destroyUpgrade = (options.destroyUpgrade !== undefined) ? options.destroyUpgrade : true;
    var destroyUpgradeTimeout = options.destroyUpgradeTimeout || 1000;

    // normalize path
    path += '/';

    function check (req) {
        return path == req.url.substr(0, path.length);
    }

    handleReq = function(req, res){
        if (!check(req)) return false;
        debug('intercepting request for path "%s"', path);
        self.handleRequest(req, res);
        return true;
    };

    server.on('close', self.close.bind(self));

    if(~self.transports.indexOf('websocket')) {
        server.on('upgrade', function (req, socket, head) {
            if (check(req)) {
                self.handleUpgrade(req, socket, head);
            } else if (false !== destroyUpgrade) {
                // default node behavior is to disconnect when no handlers
                // but by adding a handler, we prevent that
                // and if no eio thing handles the upgrade
                // then the socket needs to die!
                setTimeout(function() {
                    if (socket.writable && socket.bytesWritten <= 0) {
                        return socket.end();
                    }
                }, destroyUpgradeTimeout);
            }
        });
    }
}


function bindSocketIO(opts) {
    if (opts === false) return;
    var app = this;

    opts = _.assign({}, { clientPath: '/js/socket.io.js', transports: ['websocket', 'polling'] }, opts);
    function getClientCode() {
        var clientCode = '';
        var res = {setHeader: _.noop, writeHead: _.noop, end: function (text) { clientCode = text; }};
        app.webSockets.serve({headers: {}}, res);
        return clientCode;
    }
    getClientCode = _.memoize(getClientCode);

    app.on('listening', function (server) {
        var serveClient = opts.serveClient || opts.clientPath;
        if (serveClient) {
            // we can do it better;
            opts.serveClient = false;
            var sockClientPath = opts.clientPath || '/socket.io.js';
            app.router.get(sockClientPath, function* serve_socket_io_js(next) {
                this.type = 'application/javascript';
                this.body = getClientCode();
                yield next;
            });
        }
        app.webSockets = app.context.webSockets = new SocketIO(server, opts);
    });

    internalEngineIO.Server.prototype.attach = patchedAttach;

    return function* (next) {
        var isSockRequest = handleReq && handleReq(this.req, this.res);
        if (isSockRequest) {
            this.respond = false;
            return;
        }
        yield next;
    }
}



module.exports = bindSocketIO;
