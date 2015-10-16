/**
 * Created by syntaxfish on 15. 6. 28..
 */
(function() {
    "use strict";
    var config = require('config');
    var pushTypes = config.get('Push.SupportPushTypes');
    var DeviceBuffer = require('./lib/deviceBuffer');

    var Rabbitmq = require('./lib/rabbitmq');
    var rabbitmq = new Rabbitmq();

    var PushManager = require('./lib/pushManager');
    var pushManager = new PushManager();

    //var RedisManager = require('./lib/redisManager');
    //var redisMananger = new RedisManager();

    var PUSH_KEY_PREFIX = 'push:status:hash:';
    var notificationAssociations = require('./lib/notificationAssociations_.js');

    rabbitmq.consume('notification', {}, function (err, job, ack) {
        if(err) { return process.exit(1); }
        var deviceBuffers = {};
        var endBufferCount = 0;

        if(job.page == 0) { notificationAssociations.startPush(job.pushId); }

        // init buffers
        pushTypes.forEach(function (type) {
            deviceBuffers[type] = new DeviceBuffer();
            deviceBuffers[type].addFlushListener(function (devices){
                // Send Push Notification
                if(devices.length > 0) {
                    _deDuplication(job.pushId, devices, function (err, deviceSet) {
                        pushManager.notify(type, deviceSet, job.payload);
                    });
                }
            });

            deviceBuffers[type].addEndListener(function (){
                if((++endBufferCount) == Object.keys(deviceBuffers).length) {
                    if(job.isLast) { notificationAssociations.finishPush(job.pushId); }
                    ack();
                }
            });
        });

        // add to buffer
        notificationAssociations.findDevices(job.condition, job.page * job.itemPerPage, job.itemPerPage, function(err, devices) {
            if(!devices) { return; }

            devices.forEach(function (device) {
                var buffer = deviceBuffers[device.pushType];
                if(!buffer) { return; }
                buffer.add(device.deviceToken);
            });

            // End Job
            Object.keys(deviceBuffers).forEach(function (type) {
                deviceBuffers[type].end();
            });
        });
    });

    process.on('uncaughtException', function(error) {
        console.log('[%d] uncaughtException : ', process.pid, error.stack);
        process.exit(1);
    });
    
    function _deDuplication(pushId, devices, callback){
        // TODO de-duplication
        callback(null, devices);
        /*
        var multi = redisMananger.write('push').multi();
        var redisKey = PUSH_KEY_PREFIX+pushId;

        for( var i = 0; i < devices.length; i++ ) {
            multi.sadd(redisKey, devices[i]);
        }

        multi.exec(function (err, result) {
            devices = devices.filter(function (v, i) {
                return result[i] === 1;
            });

            callback(err, devices);
        });
        */
    }
})();