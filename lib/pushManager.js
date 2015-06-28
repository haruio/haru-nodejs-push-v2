/**
 * Created by syntaxfish on 15. 6. 27..
 */

module.exports = (function() {
    "use strict";

    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;
    var config = require('config');

    var Providers = require('../provider');

    function PushManager() {
        var self = this;
        this.providers = {};

        Object.keys(Providers).forEach(function (type) {
            self.providers[type] = new Providers[type](config.get('Push.'+type));
            self.providers[type].on('deviceGone', function onDeviceGone(devices){
                // remove device
                if(devices !== null && devices.length > 0) {
                    pushAssociations.removeDevices(devices);
                }
            })
        });

        EventEmitter.call(this);
    };

    inherits(PushManager, EventEmitter);

    PushManager.prototype.notify = function(pushType, devices, payload, callback) {
        var provider = this.providers[pushType];
        if(!provider) { return; }

        provider.pushNotification(devices, payload);
    };

    return PushManager;
})();