/**
 * Created by Asterisk on 3/13/15.
 */
module.exports = (function() {
    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;
    var mongoose = require('mongoose');
    var schema = require('./db/schema');
    var config = require('config');
    var async = require('async');


    function PushAssociations() {
        var db = this.db = mongoose.connect(config.get('Moncast.mongodb.host'));
        this.UserDevice = db.model('UserDevice', schema.UserDevice);
        this.Push = db.model('Push', schema.Push);
        this.ScheduledPush = db.model('ScheduledPush', schema.ScheduledPush);

        EventEmitter.call(this);
    };

    inherits(PushAssociations, EventEmitter);

    PushAssociations.prototype.find = function(condition, skip, limit, callback) {
        this.UserDevice.find(condition, {deviceToken: 1, uuid: 1, pushType: 1})
            .lean()
            .skip(skip)
            .limit(limit)
            .exec(callback);
    };

    PushAssociations.prototype.getOne = function(condition, callback) {
        var wrappedCallback = outputFilterWrapper(callback);

        this.UserDevice.findOne(condition, {deviceToken: 1, uuid: 1, pushType: 1})
            .lean()
            .exec(wrappedCallback);
    };

    PushAssociations.prototype.count = function(condition, callback) {
        this.UserDevice.count(condition, callback);
    };

    PushAssociations.prototype.savePush = function(notification, callback) {
        var doc = {
            _id: notification.pushId,
            type: notification.type ? notification.type : 'etc',
            condition: JSON.stringify(notification.condition),
            message: notification.data,
            createdBy: notification.createdBy,

            sendCount: notification.count,
            createdAt: new Date().getTime(),
            startedAt: new Date().getTime(),
        };

        new this.Push(doc).save(callback);
    };

    PushAssociations.prototype.genPushId = function(callback) {
        if(callback) { return callback(null, new mongoose.Types.ObjectId); }

        return new mongoose.Types.ObjectId;
    };

    PushAssociations.prototype.getPushes = function(condition, skip, limit, callback) {
        this.Push.find(condition)
            .skip(skip)
            .limit(limit)
            .lean()
            .sort({createdAt: -1})
            .exec(callback);
    };

    PushAssociations.prototype.countPushes = function(condition, callback) {
        this.Push.count(condition, callback);
    };

    PushAssociations.prototype.countDevices = function(condition, callback) {
        this.UserDevice.count(condition, callback);
    };

    PushAssociations.prototype.addDevice = function(deviceInfo, callback) {
        this.UserDevice.findOneAndRemove({uuid: deviceInfo.uuid}, function(err, result) {
            if (err)
                callback(err);
            else
                UserDevice.create(deviceInfo, callback);
        });
    };

    PushAssociations.prototype.removeDevice = function(deviceToken, callback) {
        if (deviceToken instanceof Array)
            this.UserDevice.remove({deviceToken: {$in: deviceToken}}, callback);
        else
            this.UserDevice.remove({deviceToken: deviceToken}, callback);
    };

    PushAssociations.prototype.removeByUuid = function(uuid, callback) {
        if (uuid instanceof Array)
            this.UserDevice.remove({uuid: {$in: uuid}}, callback);
        else
            this.UserDevice.remove({uuid: uuid}, callback);
    };

    PushAssociations.prototype.registerUser = function(uuid, user, callback) {
        if (user)
            this.UserDevice.findOneAndUpdate({uuid: uuid}, {$set: {user: user}}, callback);
        else
            this.UserDevice.findOneAndUpdate({uuid: uuid}, {$unset: {user: ''}}, callback);
    };

    PushAssociations.prototype.registerChannels = function(user, channels, callback) {
        this.UserDevice.findOneAndUpdate({user: user}, {$pushAll: {channels: channels}}, callback);
    };

    PushAssociations.prototype.unregisterChannels = function(user, channels, callback) {
        this.UserDevice.findOneAndUpdate({user: user}, {$pullAll: {channels: channels}}, callback);
    };

    PushAssociations.prototype.finishSendPush = function(id, callback) {
        this.Push.findOneAndUpdate({_id: id}, {finishedAt: new Date().getTime()} , callback);
    };

    PushAssociations.prototype.saveScheduledPush = function(push, callback) {
        push.createdAt = new Date().getTime();
        push.status = 'approved';

        this.ScheduledPush.create(push, callback);
    };

    PushAssociations.prototype.getTotalScheduledPushes = function(condition, skip, limit, callback) {
        this.ScheduledPush.find(condition)
            .skip(skip)
            .limit(limit)
            .lean()
            .sort({createdAt: -1})
            .exec(callback);
    };

    PushAssociations.prototype.getScheduledPushes = function(status, callback) {
        var query = {pushTime: {$lt: new Date().getTime()}};
        //var query = {};
        if(status) {
            query.status = status;
        }
        this.ScheduledPush.find(query)
            .lean()
            .exec(callback);
    };

    PushAssociations.prototype.changeScheduledPushStatus = function(id, status, callback) {
        if(status == 'approved') {
            this.ScheduledPush.findOneAndUpdate({_id: id, status: 'waiting'}, {status: status}, callback);
        } else if(status == 'canceled') {
            this.ScheduledPush.findOneAndUpdate({_id: id, status: {$ne: 'published'}}, {status: status}, callback);
        } else {
            this.ScheduledPush.findByIdAndUpdate(id, {status: status}, callback);
        }
    };

    PushAssociations.prototype.cancelScheduledPush = function(id, callback) {
        this.ScheduledPush.findOneAndUpdate({_id: id, status: 'approved'}, {status: 'canceled'}, callback);
    };

    PushAssociations.prototype.updateSchedulePush = function(id, schedulePush, callback) {
        this.ScheduledPush.findOneAndUpdate({_id: id}, {$set: schedulePush}, callback);
    };


    return new PushAssociations();
})();


