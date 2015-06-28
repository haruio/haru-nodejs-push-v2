/**
 * Created by syntaxfish on 15. 6. 27..
 */
var DeviceBuffer = module.exports = (function() {
    "use strict";
    var config = require('config');

    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;
    
    function DeviceBuffer(options) {
        var self = this;
        this.options = options || config.get('Push.DefaultBufferOptions');
        this.deviceBuffer = [];

        this.on('device', function onAdded(device){
            if(self.deviceBuffer.length >= self.options.maxSize) {
                self.emit('flush');
            }
        });

        this.on('end', function onEnd() {

        });

        EventEmitter.call(this);
    };
    
    inherits(DeviceBuffer, EventEmitter);
    

    DeviceBuffer.prototype.add = function(device) {
        this.deviceBuffer.push(device);
        this.emit('device', device);
    };

    DeviceBuffer.prototype.addFlushListener = function(doFlush) {
        var self = this;
        var wrappedDoFlush = (function() {
            return function (isCallEndFunction) {
                var maxSize = self.options.maxSize > self.deviceBuffer.length ? self.deviceBuffer.length : self.options.maxSize;
                doFlush(self.deviceBuffer.slice(0, maxSize));
                self.deviceBuffer.splice(0, maxSize);
                if(isCallEndFunction) { self.emit('end'); }
            }
        })();

        this.on('flush', wrappedDoFlush);
    };

    DeviceBuffer.prototype.addEndListener = function(doEnd) {
       this.on('end', doEnd);
    };

    DeviceBuffer.prototype.end = function() {
        this.emit('flush', true);
    };

    DeviceBuffer.prototype.getDevices = function() {
        return this.deviceBuffer;
    };

    return DeviceBuffer;
})();