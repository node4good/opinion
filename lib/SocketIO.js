"use strict";
var _ = require('lodash-contrib');
var SocketIO = require('socket.io');
var internalEngineIO = require('socket.io/node_modules/engine.io');
var debuglog = require('util').debuglog('opinion');


function extractClientCode(webSockets) {
    var clientCode = '';
    webSockets.serve(
        // Mock `req`
        {headers: {}},
        // mock `res`
        {
            setHeader: _.noop,
            writeHead: _.noop,
            end: function (text) { clientCode = text; }
        }
    );
    return clientCode;
}


function bindSocketIO(opts) {
    var app = this; // jshint ignore:line
    if (opts === false) return;
    opts = _.defaults(opts || {}, {
            clientPath: '/js/socket.io.js',
            transports: ['websocket', 'polling'],
            destroyUpgrade: true,
            destroyUpgradeTimeout: 1000
        }
    );
    if (opts.serveClient || opts.clientPath) {
        opts.clientPath = opts.clientPath || '/socket.io.js';
        // we can do it better;
        opts.serveClient = false;
    }
    opts.normPrefix = (opts.path || '/socket.io').replace(/\/$/, '') + '/';


    var handleReq;
    internalEngineIO.Server.prototype.attach = function patchedAttach(server, opts) {
        var engine = this;

        server.on('close', engine.close.bind(engine));

        handleReq = function (context) {
            context.respond = false;
            engine.handleRequest(context.req, context.res);
        };

        if (!~engine.transports.indexOf('websocket')) return;
        server.on('upgrade', function handleUpgrade(req, socket, head) {
            console.log('  \x1B[90m<-- \x1B[;1m%s\x1B[0;90m %s\x1B[0m', req.method, req.url);
            if (req.url.indexOf(opts.normPrefix) === 0) {
                engine.handleUpgrade(req, socket, head);
                console.log('  \x1B[90m-^- \x1B[;1m%s\x1B[0;90m %s\x1B[0m', 'Upgraded', req.url);
            } else if (opts.destroyUpgrade) {
                // default node behavior is to disconnect when no handlers
                // but by adding a handler, we prevent that
                // and if no eio thing handles the upgrade
                // then the socket needs to die!
                setTimeout(function () {
                        if (!socket.writable || socket.bytesWritten > 0) return;
                        socket.end();
                        console.log('  \x1B[90m-x- \x1B[;1m%s\x1B[0;90m %s\x1B[0m', 'Destroyed', req.url);
                    },
                    opts.destroyUpgradeTimeout
                );
            }
        });
    };


    // some setup that should be triggered only when the app has started listening
    app.on('listening', function (server) {
        app.webSockets = app.context.webSockets = new SocketIO(server, opts);
        app.emit('webSockets-bound', app.webSockets);

        if (!opts.clientPath || !app.router) return;
        var clientCode = extractClientCode(app.webSockets);
        app.router.get(opts.clientPath, function* serve_socket_io_js() {
            this.type = 'application/javascript';
            this.body = clientCode;
        });
    });


    return function* handleSocketIO(next) {
        if (!handleReq || this.url.indexOf(opts.normPrefix) !== 0) return yield next;

        debuglog('Socket.IO intercepting request for path - "%s" `%s`', this.method, this.url);
        handleReq(this);
    };
}


module.exports = bindSocketIO;
