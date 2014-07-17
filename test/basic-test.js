"use strict";
describe("the basic stuff", function () {
    var opinion = require('../');
    it("should just load", function (done) {
        var app = opinion();
        app.listen("6557", function () {
            app.theServer.close();
            done();
        });
    });


    it("should allow to get boud websockets", function (done) {
        var app = opinion();
        var sentinal = 0;
        app.listen("6557", function () {
            expect(sentinal).to.equal(1);
            app.theServer.close();
            done();
        });
        app.on('webSockets-bound', function () {
            sentinal++;
            expect(app).to.have.property('webSockets');
        });
    });


    it("should allow `connect` style middleware", function (done) {
        var opinion = require('../');
        var app = opinion();
        app.use(function (req, res, next) {
            next();
        });
        app.mock({url: '/gaga3'}, done);
    });


    it("should allow async `connect` style middleware", function (done) {
        var opinion = require('../');
        var app = opinion();
        app.use(function (req, res, next) {
            setImmediate(function () {
                res.guli = true;
                next();
            });
        });
        app.use(function (req, res, next) {
            expect(res.guli).to.equal(true);
            next();
        });
        app.mock({url: '/gaga3a'}, done);
    });


    it("should handle exception form async `connect` style middleware", function (done) {
        var opinion = require('../');
        var app = opinion();
        app.onerror = function (err, ctx) {
            expect(err).to.be.instanceof(Error).property('message').equal('gaga3a');
            ctx.res.end();
            done();
        };
        app.use(function (req, res, next) {
            setImmediate(function () {
                res.guli = true;
                next(new Error('gaga3a'));
            });
        });
        app.use(function (req, res, next) {
            expect(res.guli).to.equal(true);
            next();
        });
        app.mock({url: '/gaga3a'});
    });
});
