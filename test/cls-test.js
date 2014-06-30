"use strict";
describe("CLS testing", function () {
    var opinion = require('../');
    it("CLS namespace should exist", function (done) {
        var app = opinion();
        app.onerror = done;

        app.use(function* () {
            yield function* () {
                expect(global.opinionCLS.get('webContext')).equal(this);
            };
            done();
        });

        expect(global).to.have.property('opinionCLS');

        app.mock();
    });
});
