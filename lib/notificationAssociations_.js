/**
* Created by syntaxfish on 15. 7. 30..
*/
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

var accountAPI = require('./integration/devices.js');

exports.createPush = function(notification, callback){
    var _notification = _clone(notification);
    if(_notification.condition) { _notification.condition = JSON.stringify(_notification.condition); }
    if(_notification.segments) { _notification.segments = JSON.stringify(_notification.segments); }

    new Push2(_notification).save(callback);
};

exports.updatePush = function(id, notification, callback){
    var _notification = _clone(notification);
    if(_notification.condition) { _notification.condition = JSON.stringify(_notification.condition); }
    if(_notification.segments) { _notification.segments = JSON.stringify(_notification.segments); }

    Push2.findOneAndUpdate({_id: id}, {$set: _notification} , callback);
};

exports.findPush = function(condition, skip, limit, callback){
    delete condition.skip;
    delete condition.limit;

    Push2.find(condition, {condition: 0, __v: 0})
        .sort({createdAt: -1})
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .lean()
        .exec(callback);
};

exports.getPush = function(id, callback){
    Push2.findOne({_id: id}).lean().exec(callback);
};

exports.countPush = function(condition, callback){
    accountAPI.count(condition, callback);
};

exports.cancelReservedPush = function(pushId, callback) {
    Push2.findOneAndUpdate({_id: pushId, status: 'waiting'}, {$set: {status: 'canceled', updatedAt: Date.now()}}, callback);
};

exports.updateReservedPush = function(pushId, notification, callback){
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
};


exports.sendImmediately = function(pushId, callback){
    var notification = {
        updatedAt: Date.now(),
        publishTime: Date.now()
    };

    Push2.findOneAndUpdate({_id: pushId, status: 'waiting'}, {$set: notification}, function (err, result) {
        result.publishTime = notification.publishTime;
        result.updatedAt = notification.updatedAt;

        callback(err, result)
    });
};

exports.findDevices = function(condition, skip, limit, callback){
    accountAPI.find(condition, skip, limit, function (err, arr) {
        callback(err, arr);
    });
};

exports.finishPush = function(pushId, callback){
    Push2.update({_id: pushId}, {$set: {finishedAt: Date.now(), status: 'published'}} , function (err, results) {
        if(callback) { callback(err, results); }
    });
};


exports.startPush = function(pushId, callback){
    Push2.update({_id: pushId}, {$set: {startedAt: Date.now(), status: 'approved'}} ,function (err, results) {
        if(callback) { callback(err, results); }
    });
};

exports.getReservedPush = function(callback){
    Push2.find({status: 'waiting', publishTime: {$lt: Date.now()}}, {condition: 0, __v: 0})
        .lean()
        .sort({createdAt: -1})
        .exec(callback);
};

exports.updateRegistrationIds = function(registrationIds, callback) {
    accountAPI.updateRegistrationIds(registrationIds, callback);
};

exports.removeRegistrationIds = function(registrationIds, callback) {
    accountAPI.removeRegistrationIds(registrationIds, callback);
};

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