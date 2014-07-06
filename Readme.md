[![Build Status](https://travis-ci.org/TheNodeILs/opinion.png?branch=master "Build Status")](https://travis-ci.org/TheNodeILs/opinion) 

[![NPM](https://nodei.co/npm/opinion.png)](https://nodei.co/npm/opinion/) 

# koa opinions

Originally forked from `koajs/common` 


## Installation

```js
$ npm install opinion
```

## default configuration

First of all we have a builtin [routing mechanism](https://github.com/alexmingoia/koa-router)

An extensive default middleware stack
```js
DEFAULT_MIDDLEWARE_STACK = {
    NoKeepAlive: common.NoKeepAlive,
    responseTime: common.responseTime,
    logger: common.logger,
    compress: common.compress,
    conditionalGet: common.conditionalGet,
    etag: common.etag,
    statics: common.statics,
    session: common.session,
    csrf: common.csrf,
    router: common.router
};
```
The request `ctx` has been extended with a `send` method to send files, and a `render` method to render views using any [`consolidate`](https://github.com/visionmedia/consolidate.js) compatible render engine, or plain `html` files.  

And as a extra bonus, `socket.io` is builtin and can be enabled by configuration flag.

# Usage

```js
"use strict";
var opinion = require('opinion');


var app = opinion({
    middlewareOrder: opinion.DEFAULT_MIDDLEWARE_STACK, // this can be manipulated
    // here are some configurations, both general, and middleware specific (by name)
    keys: ['78fd9fe83f2af46f2a8b567154db8d2a'],
    statics: 'assets',
    render: ['views', 'dust'],
    socketio: { clientPath: '/js/socket.io.js' }
});


// simple route
app.get('/',
    function* () {
        yield this.render('hello-world');
    }
);


// a CORS enabled proxy to `gist.github.com`
app.get('/snippet/cors/:user/:id', function* () {
    this.set('Access-Control-Allow-Origin', '*');
    this.set('Access-Control-Allow-Methods', 'GET');
    this.set('Access-Control-Allow-Headers', 'Content-Type');
    this.type = 'application/javascript';
    this.body = require('request')('https://gist.github.com/' + this.params.user + '/' + this.params.id + '/raw');
});


app.listen(prosess.env.PORT || 8080, function () {
    console.log("Server listening on %s", this._connectionKey);
});


// websocket push example
setInterval(function () {
    app.webSockets.emit('gaga', JSON.stringify(process.memoryUsage()))
}, 3000);
```


## License

  MIT

