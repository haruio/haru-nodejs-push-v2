"use strict";

var async = require('async');
var ErrorCode = require('../../error/errorCode');
var PushAssociations = require('../../lib/PushAssociations');
var isValid = require('../../lib/jsonValidator').isValid;
var RequestPush = require('../../schema/index').request.Push;
var moment_timezone = require('moment-timezone');
var pushPublisher = require('../../lib/pushPublisher');

exports.send = function(req, res, next) {
    var notification = req.body;
    async.series([
        function validCheck(callback){
            _validCheck(notification, callback);
        },
        function publishNotification(callback){
            if(notification.pushTime) {
                _reserveNotificationJob(notification, callback);
            } else {
                pushPublisher.publish(notification, callback);
            }
        }
    ], function done(error, results) {
        if(error) { return next(error); }

        res.json({
            _id: results[1].pushId,
            count: results[1].count,
            pushTime: results[1].pushTime,
            timezone: results[1].timezone
        });
    });
};

exports.cancelReserveNotification = function(req, res, next) {
    var id = req.params.id;

    PushAssociations.cancelScheduledPush(id, function (err, result) {
        if(err) { return next(err); }
        if(!result) { return next(new Error("INVALID_PUSH_ID")); }

        res.json({canceled: id});
    });
};

exports.updateReserveNotification = function(req, res, next) {
    var id = req.params.id;
};

function _validCheck(notification, callback){
    var error = null;
    if(!isValid(notification, RequestPush)) {
        error = ErrorCode.INVALID_NOTIFICATION;
    }

    return callback(error);
};

function _reserveNotificationJob(notification, callback){
    notification.pushTime = new Date(moment_timezone.tz(notification.pushTime, notification.timezone).format()).valueOf();

    PushAssociations.saveScheduledPush(notification, callback);
};