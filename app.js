var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

/** v1 **/
var deviceV1 = require('./routes/v1/device');
var pushesV1 = require('./routes/v1/pushes');

/** v2 **/
var pushV2 = require('./routes/v2/push');
var timezone = require('./routes/v2/timezone');
//var mail = require('./routes/v2/mail');


var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cors());

app.use('/v1/device', deviceV1);
app.use('/v1/pushes', pushesV1);

app.use('/v2/device', deviceV1);
app.use('/v2/pushes', pushesV1);
app.use('/v2/push', pushV2);
app.use('/v2/timezone', timezone);
//app.use('/v2/mail', mail);



app.use(function onError(err, req, res, next) {
    res.status(err.errCode ? err.errCode : 400).json({
        errorCode: err.errCode ? err.errCode : 400,
        message: err.message ? err.message : 'UNEXPECTED_EXCEPTION',
        field: err.field ? err.field : undefined
    });
});

module.exports = app;
