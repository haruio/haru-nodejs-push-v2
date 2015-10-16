/**
 * Created by syntaxfish on 15. 6. 27..
 */
module.exports = (function() {
    "use strict";
    var gcm = require('node-gcm');
    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;
    var config = require('config');
    var notificationAssociations = require('../lib/notificationAssociations_.js');


    function GcmProvider(settings) {
        this.settings = settings || config.get('Push.GCM');
        this._initPushConnection();

        EventEmitter.call(this);
    };

    inherits(GcmProvider, EventEmitter);

    GcmProvider.prototype._initPushConnection = function() {
        this.connection = new gcm.Sender(this.settings.apiKey);
        this.on('devicesGone', function (devicesGoneRegistrationIds) {
            notificationAssociations.removeRegistrationIds(devicesGoneRegistrationIds);
        });

        this.on('devicesUpdate', function (devicesUpdateRegistrationIds) {
            notificationAssociations.updateRegistrationIds(devicesUpdateRegistrationIds);
        });
    };

    GcmProvider.prototype.pushNotification = function(devices, payload) {
        var self = this;
        var message = _buildMessage(payload);

        self.connection.send(message, devices, 4, function(err, result){
            if (!err && result && result.failure) {
                var devicesGoneRegistrationIds = [], errors = [], code;
                var devicesUpdateRegistrationIds = [];

                result.results.forEach(function(value, index) {
                    code = value && value.error;
                    if (!!result.registration_id) {
                        devicesUpdateRegistrationIds.push({from: result.deviceToken, to: result.registration_id});
                    } else if(code === 'NotRegistered' || code === 'InvalidRegistration') {
                        devicesGoneRegistrationIds.push(devices[index]);
                    } else if(code) {
                        errors.push('GCM error code: ' + (code || 'Unknown') + ', deviceToken: ' + devices[index]);
                    }
                });

                if(devicesGoneRegistrationIds.length > 0) {
                    self.emit('devicesGone', devicesGoneRegistrationIds);
                }

                if(devicesUpdateRegistrationIds.length >0) {
                    self.emit('devicesUpdate', devicesUpdateRegistrationIds)
                }
            }
        });
    };

    function _buildMessage(payload){
        var options = payload.options || {};

        var message = new gcm.Message({
            timeToLive: options.timeToLive || config.get('Push.GCM.messageOptions.timeToLive'),
            collapseKey: options.collapseKey || config.get('Push.GCM.messageOptions.collapseKey'),
            delayWhileIdle: options.delayWhileIdle || config.get('Push.GCM.messageOptions.delayWhileIdle')
        });

        Object.keys(payload).forEach(function(key) {
            if( payload[key] ) {
                message.addData(key, payload[key]);
            }
        });

        return message;
    };

    return GcmProvider;
})();



