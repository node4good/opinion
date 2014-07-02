"use strict";
describe("CLS testing", function () {
    var opinion = require('../');
    it("CLS namespace should exist", function (done) {
        var app = opinion();
        app.onerror = function (err, ctx) {
            ctx.res.headersSent = true;
            throw err;
        };

        app.use(function* () {
            yield function* () {
                expect(global.opinionCLS.get('webContext')).equal(this);
            };
        });

        expect(global).to.have.property('opinionCLS');

        app.mock({url:'/gaga4'}, done);
    });
});
