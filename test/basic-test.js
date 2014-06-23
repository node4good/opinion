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
});
