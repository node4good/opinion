"use strict";
describe("CLS testing", function () {
    var opinion = require('../');
    it("CLS namespace should exist", function (done) {
        var app = opinion();
        expect(global.opinionCLS);
        done();
    });
});
