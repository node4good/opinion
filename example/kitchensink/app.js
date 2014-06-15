"use strict";
Error.stackTraceLimit = Infinity;
process.chdir(__dirname);
var opinion = require('../../');
var conf = require('./conf');

var app = opinion({
    middlewareOrder: opinion.DEFAULT_MIDDLEWARE_STACK,
    keys: ['78fd9fe83f2af46f2a8b567154db8d2a'],
    statics: 'assets',
    render: ['views', 'dust'],
    socketio: { serveClient:true }
});



app.get('/',
    function* () {
        this.body = yield this.render('hello-world');
    }
);

app.listen(conf.PORT, function () {
    console.log("Server listening on %s", this._connectionKey);
});


setInterval(function () {
    app.socketio.emit('gaga', JSON.stringify(process.memoryUsage()))
}, 3000);
