"use strict";

var ErrorCode = require('../../error/errorCode');
var PushAssociations = require('../../lib/PushAssociations');
var isValid = require('../../lib/jsonValidator').isValid;
var RequestPush = require('../../schema/index').request.Push;
var moment = require('moment-timezone');

var notificationAssociations = require('../../lib/notificationAssociations');
var notificationPublisher = require('../../lib/notificationPublisher');

exports.send = function(req, res, next) {
    var notification = req.body;

    if(notification.publishTime) { notificationPublisher.reservePush(notification, done) }
    else { notificationPublisher.publishPush(notification, done) }

    function done(error, result){
        if(error) { return next(error); }

        res.json({
            pushId: result.pushId,
            timezone: result.timezone,
            sendCount: result.sendCount,
            publishTime: _convertTime(result.timezone, result.publishTime),
            createdAt: _convertTime(result.timezone, result.createdAt)
        });
    };
};

exports.getPush = function(req, res, next) {
    var id = req.params.id;

    notificationAssociations.getPush(id, function (err, notification) {
        if(err) { return next(err); }
        if(!notification) { return next(new Error("INVALID_PUSH_ID")); }
        _convertNotificationTimes(notification);
        res.json(notification);
    });
};

exports.pushList = function(req, res, next) {
    var skip = req.query.skip || 0;
    var limit = req.query.limit || 10;

    notificationAssociations.findPush(req.query, skip, limit, function (err, results) {
        if(err) { return next(err); }

        results.forEach(function (notification) {
            _convertNotificationTimes(notification);
        });

        res.json(results);
    });
};

exports.cancelReserveNotification = function(req, res, next) {
    var id = req.params.id;

    notificationAssociations.cancelReservedPush(id, function (err, result) {
        if(err) { return next(err); }
        if(!result) { return next(new Error("INVALID_PUSH_ID")); }

        res.json({canceled: id});
    });
};

exports.updateReserveNotification = function(req, res, next) {
    var id = req.params.id;
    var notification = req.body;

    if(notification._id){
        delete notification._id;
    }

    notificationAssociations.updateReservedPush(id, notification, function (err, result) {
        res.json({
            pushId: result._id,
            sendCount: result.sendCount,
            publishTime: _convertTime(result.timezone, result.publishTime),
            createdAt: _convertTime(result.timezone, result.createdAt),
            updatedAt: _convertTime(result.timezone, result.updatedAt)
        });
    });
};

exports.sendImmediately = function(req, res, next) {
    var id = req.params.id;
    notificationAssociations.sendImmediately(id, function (err, result) {
        if(err) { return next(err); }
        if(!result) { return next(new Error("INVALID_PUSH_ID")); }

        res.json({
            pushId: result._id,
            sendCount: result.sendCount,
            publishTime: _convertTime(result.timezone, result.publishTime),
            createdAt: _convertTime(result.timezone, result.createdAt),
            updatedAt: _convertTime(result.timezone, result.updatedAt)
        });
    });
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

    if(notification.condition.user) {
        notification.type = 'user';
    } else if(notification.condition.channel) {
        notification.type = 'channel';
    } else if(notification.condition && Object.keys(notification.condition).length === 0) {
        notification.type = 'all';
    } else {
        notification.type = 'etc';
    }

    PushAssociations.saveScheduledPush(notification, callback);
};


function _convertNotificationTimes(notification) {
    notification.createdAt = _convertTime(notification.timezone, notification.createdAt);
    notification.updatedAt = _convertTime(notification.timezone, notification.updatedAt);
    if(notification.publishTime) {
        notification.publishTime = _convertTime(notification.timezone, notification.publishTime);
    }
    if(notification.startedAt) {
        notification.startedAt = _convertTime(notification.timezone, notification.startedAt);
    }
    if(notification.finishedAt) {
        notification.finishedAt = _convertTime(notification.timezone, notification.finishedAt);
    }

    return notification;
}

function _convertTime(timezone, time){
    return moment(new Date(time)).tz(timezone).format();
}