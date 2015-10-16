/**
 * Created by syntaxfish on 15. 7. 31..
 */
module.exports = (function() {
    "use strict";
    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;

    var RabbitMq = require('./rabbitmq');
    var mq = new RabbitMq();

    var async = require('async');
    var notificationAssociations = require('./notificationAssociations');
    var config = require('config');

    function NotificationPublisher() {
        this.config = config.get('Push');
        EventEmitter.call(this);
    }

    inherits(NotificationPublisher, EventEmitter);

    NotificationPublisher.prototype.publishPush = publishPush;
    NotificationPublisher.prototype.reservePush = reservePush;
    NotificationPublisher.prototype.publishReservedPush = publishReservedPush;


    function publishPush(notification, callback){
        var condition = _genCondition(notification);
        var itemPerPage = config.get('Push.PushReqUnit');
        notification.condition = condition;
        notification.status = 'approved';

        async.series([
            function countPushJob(callback){

                notificationAssociations.countPush(condition, function (err, count) {
                    notification.sendCount = count;
                    callback(err, count);
                });
            },
            function savePushJob(callback){
                notificationAssociations.createPush(notification, function (err, push) {
                    notification.pushId = push._id;
                    notification.publishTime = push.publishTime;
                    notification.createdAt = push.createdAt;
                    callback(err, push);
                });
            },
            function publishPushJob(callback){
                var numberOfJob =  Math.ceil(notification.sendCount / itemPerPage);

                async.timesSeries(numberOfJob, function(page, next) {
                    var notificationJob = {
                        pushId: notification.pushId,
                        page: page,
                        itemPerPage: itemPerPage,
                        isLast: page === numberOfJob-1,
                        condition: condition,
                        sendCount: notification.sendCount,
                        payload: _buildPayload(notification)
                    };
                    
                    mq.publish('notification', JSON.stringify(notificationJob) ,{}, next);
                }, callback);
            }
        ], function done(error, results) {
            if(error) { return callback(error); }

            callback(error, notification);
        });
    }

    function publishReservedPush(notification, callback) {
        var condition = _genCondition(notification);
        var itemPerPage = config.get('Push.PushReqUnit');
        notification.condition = condition;
        notification.status = 'approved';

        async.series([
            function countPushJob(callback){
                notificationAssociations.countPush(condition, function (err, count) {
                    notification.sendCount = count;
                    callback(err, count);
                });
            },
            function savePushJob(callback){
                notificationAssociations.updatePush(notification._id, notification, function (err, push) {
                    notification.pushId = push._id;
                    notification.publishTime = push.publishTime;
                    notification.createdAt = push.createdAt;
                    callback(err, push);
                });
            },
            function publishPushJob(callback){
                var numberOfJob =  Math.ceil(notification.sendCount / itemPerPage);

                async.timesSeries(numberOfJob, function(page, next) {
                    var notificationJob = {
                        pushId: notification.pushId,
                        page: page,
                        itemPerPage: itemPerPage,
                        isLast: page === numberOfJob-1,
                        condition: condition,
                        sendCount: notification.sendCount,
                        payload: _buildPayload(notification)
                    };

                    mq.publish('notification', JSON.stringify(notificationJob) ,{}, next);
                }, callback);
            }
        ], function done(error, results) {
            if(error) { return callback(error); }

            callback(error, notification);
        });
    }

    function reservePush(notification, callback){
        var condition = _genCondition(notification);
        async.series([
            function countPushJob(callback){
                notificationAssociations.countPush(condition, function (err, count) {
                    notification.sendCount = count;
                    callback(err, count);
                });
            },
            function savePushJob(callback){
                notificationAssociations.createPush(notification, function (err, push) {
                    notification.pushId = push._id;
                    notification.publishTime = push.publishTime;
                    notification.createdAt = push.createdAt;
                    callback(err, push);
                });
            }
        ], function done(error, results) {
            if(error) { return callback(error); }

            callback(error, notification);
        });
    };
    
    function _genCondition(notification){
        var condition = notification.segments || {};

        // set condition
        switch(notification.sendType) {
            case "Everyone":
                break;
            case "Channels":
                notification.channels = Array.isArray(notification.channels) ? notification.channels : [notification.channels];
                condition.channels = {$in: notification.channels};
                break;
            case "Unique":
                notification.deviceTokens = Array.isArray(notification.deviceTokens) ? notification.deviceTokens : [notification.deviceTokens];
                condition.deviceToken = {$in: notification.deviceTokens};
                break;
            case "Segments":
                break;
        }

        // set device type
        if(notification.deviceType !== 'ALL') {
            condition.deviceType = notification.deviceType;
        }

        return condition;
    };
    
    function _buildPayload(notification){
        var payload = {
            message: {}
        };

        Object.keys(notification.payload).forEach(function (key) {
            payload[key] = notification.payload[key];
        });

        payload.message.link = notification.link;
        payload.message.pushLinkUrl = notification.pushLinkUrl;
        
        return payload;
    };

    return new NotificationPublisher();
})();

