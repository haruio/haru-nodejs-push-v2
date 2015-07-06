"use strict";

var Rabbitmq = require('../../lib/rabbitmq');
var rabbitmq = new Rabbitmq();
var async = require('async');
var ErrorCode = require('../../error/errorCode');
var PushAssociations = require('../../lib/PushAssociations');
var config = require('config');
var isValid = require('../../lib/jsonValidator').isValid;
var RequestPush = require('../../schema/index').request.Push;


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

        res.json({
            _id: results[1]._id,
            count: results[1].count
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

function _publishNotificationJob(notification, callback){
    var condition = notification.condition || {};
    var itemPerPage = config.get('Push.PushReqUnit');
    async.series([
        function countJob(callback){
            PushAssociations.count(condition, function (err, count) {
                notification.count = count;
                callback(err);
            });
        },
        function genNotificationId(callback){
            // TODO save to mongo and get mongoId
            PushAssociations.savePush(notification, function (err, obj) {
                notification._id = obj._id;
                callback(err);
            });
        },
        function publishNotificationJob(callback){
            var numberOfJob =  Math.ceil(notification.count / itemPerPage);
            var createdAt = new Date().valueOf();
            async.timesSeries(numberOfJob, function(page, next) {
                var notificationJob = {
                    pushId: notification._id,
                    page: page,
                    itemPerPage: itemPerPage,
                    isLast: page === numberOfJob-1,
                    notification: notification,
                    createdAt: createdAt
                };

                if(notificationJob.notification.data.message) {
                    notificationJob.notification.data.message.pushId = notification._id;
                    notificationJob.notification.data.message.createdAt = createdAt;
                }



                rabbitmq.publish('notification', JSON.stringify(notificationJob) ,{}, next);
            }, function(err) {
                callback(err);
            });
        }
    ], function done(error, results) {
        callback(error, notification);
    });
};