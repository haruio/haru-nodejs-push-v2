"use strict";

var Rabbitmq = require('../lib/rabbitmq');
var rabbitmq = new Rabbitmq();
var async = require('async');
var ErrorCode = require('../error/errorCode');
var PushAssociations = require('../lib/PushAssociations');
var config = require('config');
var isValid = require('../lib/jsonValidator').isValid;
var RequestPush = require('../schema').request.Push;


exports.send = function(req, res, next) {
    var notification = req.body;
    async.series([
        function validCheck(callback){
            _validCheck(notification, callback);
        },
        function publishNotification(callback){
            notification.pushId = PushAssociations.genPushId();

            _publishNotificationJob(notification, callback);
        }
    ], function done(error, results) {
        if(error) { return next(error); }

        res.json({pushId: notification.pushId});
    });
};

function _validCheck(notification, callback){
    var error = null;
    if(!isValid(notification, RequestPush)) {
        error = ErrorCode.INVALID_NOTIFICATION;
    }

    return callback(error);
};

function _publishNotificationJob(notification, callback){
    var condition = notification.condition || {};
    var itemPerPage = config.get('Push.PushReqUnit');

    async.waterfall([
        function genNotificationId(callback){
            // TODO save to mongo and get mongoId
            PushAssociations.savePush(notification, callback);
        },
        function countJob(pushes, number, callback){
            PushAssociations.count(condition, function (err, count) {
                callback(err, Math.ceil(count / itemPerPage), pushes._id);
            });
        },
        function publishNotificationJob(numberOfJob, pushId, callback){
            async.timesSeries(numberOfJob, function(page, next) {
                var notificationJob = {
                    pushId: pushId,
                    page: page,
                    itemPerPage: itemPerPage,
                    isLast: page === numberOfJob-1,
                    notification: notification
                };

                rabbitmq.publish('notification', JSON.stringify(notificationJob) ,{}, next);
            }, function(err) {
                callback(err);
            });
        }
    ], function done(error, results) {
        callback(error);
    });
};