"use strict";
describe("routing testing", function () {
    var opinion = require('../');
    it("can we set and read a route", function (done) {
        var app = opinion();

        app.get('/gaga5', function* () {
            this.body = '5gaga';
        });

        app.mock({url:'/gaga5'}, function(body) {
            expect(body).equal('5gaga');
            done();
        });
    });
});
