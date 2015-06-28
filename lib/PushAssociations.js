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
        this.db = mongoose.connect(config.get('Moncast.mongodb.host'));
        this.UserDevice = this.db.model('UserDevice', schema.UserDevice);

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

    return new PushAssociations();
})();


