/**
 * Created by syntaxfish on 15. 7. 7..
 */
module.exports = (function() {
    "use strict";

    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;


    var Rabbitmq = require('./rabbitmq');
    var rabbitmq = new Rabbitmq();
    var async = require('async');
    var PushAssociations = require('./PushAssociations');
    var config = require('config');

    function PushPublisher() {

        EventEmitter.call(this);
    };

    inherits(PushPublisher, EventEmitter);


    PushPublisher.prototype.publish = function(notification, callback) {
        var condition = notification.condition || {};
        var itemPerPage = config.get('Push.PushReqUnit');

        notification.pushId = PushAssociations.genPushId();

        async.series([
            function countJob(callback){
                PushAssociations.count(condition, function (err, count) {
                    notification.count = count;
                    callback(err);
                });
            },
            function genNotificationId(callback){
                // TODO save to mongo and get mongoId
                PushAssociations.savePush(notification, callback);
            },
            function publishNotificationJob(callback){
                var numberOfJob =  Math.ceil(notification.count / itemPerPage);
                var createdAt = new Date().valueOf();
                async.timesSeries(numberOfJob, function(page, next) {
                    var notificationJob = {
                        pushId: notification.pushId,
                        page: page,
                        itemPerPage: itemPerPage,
                        isLast: page === numberOfJob-1,
                        notification: notification,
                        createdAt: createdAt
                    };

                    if(notificationJob.notification.data.message) {
                        notificationJob.notification.data.message.pushId = notification.pushId;
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

    return new PushPublisher();

})();
