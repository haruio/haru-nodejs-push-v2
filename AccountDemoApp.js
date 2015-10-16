/**
 * Created by syntaxfish on 15. 9. 29..
 */
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();
var router = express.Router();

app.set('port', 8080);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cors());

var dummy = [{
        deviceToken: "052864b2 724b3ac6 5e5f49ae 48b99722 862e710c ed7329ae cf1867e0 921b9884",
        pushType: "APN",
        uuid: "052864b2 724b3ac6 5e5f49ae 48b99722 862e710c ed7329ae cf1867e0 921b9884"
    }];

/* Push */
router.get('/devices', function (req, res) {
    console.log('get devices');

    res.json(dummy);
});

router.get('/devices/count', function (req, res) {
    console.log('get devices count');

    res.json({
        "count": dummy.length
    });
});

router.put('/devices', function (req, res) {
    console.log(req.body);

    res.end();
});

router.post('/devices/remove', function (req, res) {
    console.log(req.body);

    res.end();
});


/* Email */
router.get('/email', function (req, res) {
    res.json([]);
});

app.use("", router);

app.use(function onError(err, req, res, next) {
    res.status(err.errCode ? err.errCode : 400).json({
        errorCode: err.errCode ? err.errCode : 400,
        message: err.message ? err.message : 'UNEXPECTED_EXCEPTION',
        field: err.field ? err.field : undefined
    });
});

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

process.on('uncaughtException', function(error) {
    console.log('[%d] uncaughtException : ', process.pid, error.stack);
    process.exit(1);
});