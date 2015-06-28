/**
 * Created by syntaxfish on 15. 6. 27..
 */
module.exports = (function() {
    "use strict";

    var mqtt = require('mqtt');
    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;

    function MqttProvider( settings ) {
        this.settings = settings || config.get('Push.MQTT');
        this._initPushConnection();

        EventEmitter.call(this);
    };

    inherits(MqttProvider, EventEmitter);

    MqttProvider.prototype._initPushConnection = function( settings ) {
    };


    MqttProvider.prototype.pushNotification = function( devices, payload ) {
    };

    function _buildMessage(payload){
        return null;
    };

    return MqttProvider;
})();

