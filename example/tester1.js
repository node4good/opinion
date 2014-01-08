var koacommon = require('../');
var conf = {
    PORT: process.env.PORT || 80
};
var app = koacommon({
    keys: ['hell yeah']
});





var server = app.listen(conf.PORT, function () {
    console.log("Server listening on %s", server._connectionKey);
});
