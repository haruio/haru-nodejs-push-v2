/**
 * Created by syntaxfish on 15. 7. 30..
 */
module.exports = (function() {
    "use strict";

    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;
    var mongoose = require('mongoose');
    var schema = require('./db/schema');
    var config = require('config');
    var async = require('async');

    var db = mongoose.createConnection(config.get('Moncast.mongodb.host'));
    var UserDevice = db.model('UserDevice', schema.UserDevice);
    var Push2 = db.model('Push2', schema.Push2);

    function NotificationAssociations() {

        EventEmitter.call(this);
    };

    inherits(NotificationAssociations, EventEmitter);


    NotificationAssociations.prototype.createPush = createPush;
    NotificationAssociations.prototype.updatePush = updatePush;
    NotificationAssociations.prototype.findPush = findPush;
    NotificationAssociations.prototype.countPush = countPush;
    NotificationAssociations.prototype.cancelReservedPush = cancelReservedPush;
    NotificationAssociations.prototype.updateReservedPush = updateReservedPush;
    NotificationAssociations.prototype.sendImmediately = sendImmediately;
    NotificationAssociations.prototype.getPush = getPush;
    NotificationAssociations.prototype.findDevices = findDevices;
    NotificationAssociations.prototype.finishPush = finishPush;
    NotificationAssociations.prototype.startPush = startPush;
    NotificationAssociations.prototype.getReservedPush = getReservedPush;

    function createPush(notification, callback){
        var _notification = _clone(notification);
        if(_notification.condition) { _notification.condition = JSON.stringify(_notification.condition); }
        if(_notification.segments) { _notification.segments = JSON.stringify(_notification.segments); }

        new Push2(_notification).save(callback);
    }

    function updatePush(id, notification, callback){
        var _notification = _clone(notification);
        if(_notification.condition) { _notification.condition = JSON.stringify(_notification.condition); }
        if(_notification.segments) { _notification.segments = JSON.stringify(_notification.segments); }

        Push2.findOneAndUpdate({_id: id}, {$set: _notification} , callback);
    }

    function findPush(condition, skip, limit, callback){
        if(!skip) { skip = 0; }
        if(!limit) { limit = 10; }

        Push2.find(condition, {condition: 0, __v: 0})
            .lean()
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .exec(callback);
    }

    function getPush(id, callback){
        Push2.findOne({_id: id}).lean().exec(callback);
    };

    function countPush(condition, callback){
        UserDevice.count(condition, callback);
    }

    function cancelReservedPush(pushId, callback) {
        Push2.findOneAndUpdate({_id: pushId, status: 'waiting'}, {$set: {status: 'canceled', updatedAt: Date.now()}}, callback);
    }
    
    function updateReservedPush(pushId, notification, callback){
        var condition = _genCondition(notification);
        notification.updatedAt = Date.now();
        notification.status = 'waiting';

        async.series([
            function _countPush(callback) {
                countPush(condition, function (err, count) {
                    notification.sendCount = count;
                    callback(err);
                })
            },
            function _updatePush(callback){
                Push2.findOneAndUpdate({_id: pushId, status: {$in: ['waiting','canceled']} }, {$set: notification}, callback);
            }
        ], function done(error, results) {
            results[1].updatedAt = notification.updatedAt;
            results[1].sendCount = notification.sendCount;

            callback(error, results[1]);
        });
    }
    
    function sendImmediately(pushId, callback){
        var notification = {
            updatedAt: Date.now(),
            publishTime: Date.now()
        };

        Push2.findOneAndUpdate({_id: pushId, status: 'waiting'}, {$set: notification}, function (err, result) {
            result.publishTime = notification.publishTime;
            result.updatedAt = notification.updatedAt;

            callback(err, result)
        });
    }

    function findDevices(condition, skip, limit, callback){
        UserDevice.find(condition, {deviceToken: 1, uuid: 1, pushType: 1})
            .lean()
            .skip(skip)
            .limit(limit)
            .exec(callback);
    };
    
    function finishPush(pushId, callback){
        Push2.update({_id: pushId}, {$set: {finishedAt: Date.now(), status: 'published'}} , function (err, results) {
            if(callback) { callback(err, results); }
        });
    }

    function startPush(pushId, callback){
        Push2.update({_id: pushId}, {$set: {startedAt: Date.now(), status: 'approved'}} ,function (err, results) {
            if(callback) { callback(err, results); }
        });
    }

    function getReservedPush(callback){
        Push2.find({status: 'waiting', publishTime: {$lt: Date.now()}}, {condition: 0, __v: 0})
            .lean()
            .sort({createdAt: -1})
            .exec(callback);
    }

    function _clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

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
    }

    return new NotificationAssociations();
})();