var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var bodyParser = require('body-parser');

var push = require('./routes/push');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use('/v2/push', push);

app.use(function onError(err, req, res, next) {
    res.status(err.errCode ? err.errCode : 400).json({
        errorCode: err.errCode ? err.errCode : 400,
        message: err.message ? err.message : 'UNEXPECTED_EXCEPTION',
        field: err.field ? err.field : undefined
    });
});

module.exports = app;
