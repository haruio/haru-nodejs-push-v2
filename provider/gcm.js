/**
 * Created by syntaxfish on 15. 6. 27..
 */
module.exports = (function() {
    "use strict";
    var gcm = require('node-gcm');
    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;
    var config = require('config');

    function GcmProvider(settings) {
        this.settings = settings || config.get('Push.GCM');
        this._initPushConnection();

        EventEmitter.call(this);
    };

    inherits(GcmProvider, EventEmitter);

    GcmProvider.prototype._initPushConnection = function() {
        this.connection = new gcm.Sender(this.settings.apiKey);
    };

    GcmProvider.prototype.pushNotification = function(devices, payload) {
        var self = this;
        var message = _buildMessage(payload);

        self.connection.send(message, devices, 4, function(err, result){
            if (!err && result && result.failure) {
                var devicesGoneRegistrationIds = [], errors = [], code;
                result.results.forEach(function(value, index) {
                    code = value && value.error;
                    if  (code === 'NotRegistered' || code === 'InvalidRegistration') {
                        devicesGoneRegistrationIds.push(devices[index]);
                    } else if (code) {
                        errors.push('GCM error code: ' + (code || 'Unknown') + ', deviceToken: ' + devices[index]);
                    }
                });

                if (devicesGoneRegistrationIds.length > 0) {
                    self.emit('devicesGone', devicesGoneRegistrationIds);
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



