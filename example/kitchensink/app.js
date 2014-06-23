"use strict";
process.chdir(__dirname);
var opinion = require('../..');
var conf = require('./conf');
var request = require('request');

var app = opinion({
    middlewareOrder: opinion.DEFAULT_MIDDLEWARE_STACK,
    keys: ['78fd9fe83f2af46f2a8b567154db8d2a'],
    statics: 'assets',
    render: ['views', 'dust']
});


app.get('/',
    function* () {
        yield this.render('hello-world');
    }
);

app.get('/2',
    function* () {
        this.type = 'text/html;charset=UTF-8';
        this.body = request("http://www.example.com/");
    }
);


app.get('/snippet/:user/:id', function* () {
    this.set('Access-Control-Allow-Origin', '*');
    this.set('Access-Control-Allow-Methods', 'GET');
    this.set('Access-Control-Allow-Headers', 'Content-Type');
    this.type = 'application/javascript';
    this.body = request('https://gist.github.com/' + this.params.user + '/' + this.params.id + '/raw');
});


app.listen(conf.PORT, function () {
    console.log("Server listening on %s", this._connectionKey);
});


setInterval(function () {
    app.webSockets.emit('gaga', JSON.stringify(process.memoryUsage()))
}, 3000);
