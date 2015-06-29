/**
 * Created by syntaxfish on 15. 6. 28..
 */
(function() {
    "use strict";

    var config = require('config');
    var pushTypes = config.get('Push.SupportPushTypes');
    var DeviceBuffer = require('./lib/deviceBuffer');
    var PushAssociations = require('./lib/PushAssociations');

    var Rabbitmq = require('./lib/rabbitmq');
    var rabbitmq = new Rabbitmq();

    var PushManager = require('./lib/pushManager');
    var pushManager = new PushManager();

    var RedisManager = require('./lib/redisManager');
    var redisMananger = new RedisManager();


    rabbitmq.consume('notification', {}, function (err, job, ack) {
        if(err) { return process.exit(1); }
        var page = job.page;
        var itemPerPage = job.itemPerPage;
        var deviceBuffers = {};
        var condition = job.condition;
        var endBufferTypes = [];
        var payload = job.notification;
        var pushId = job.pushId;

        // init device buffer
        pushTypes.forEach(function (type) {
            deviceBuffers[type] = new DeviceBuffer();
            deviceBuffers[type].addFlushListener(function (devices){
                // Send Push Notification
                if(devices.length > 0) {
                    _deDuplication(pushId, devices, function (err, deviceSet) {
                        pushManager.notify(type, deviceSet, payload);
                    });
                }
            });
            deviceBuffers[type].addEndListener(function (){
                endBufferTypes.push(type);

                // end
                if(endBufferTypes.length == Object.keys(deviceBuffers).length) {
                    ack();
                }
            });
        });

        PushAssociations.find(condition, page * itemPerPage, itemPerPage, function(err, devices) {
            devices.forEach(function (device) {
                var buffer = deviceBuffers[device.pushType];
                if(!buffer) { return; }
                buffer.add(device.uuid);
            });

            // End Buffers
            Object.keys(deviceBuffers).forEach(function (type) {
                deviceBuffers[type].end();
            });
        });
    });

    process.on('uncaughtException', function(error) {
        console.log('[%d] uncaughtException : ', process.pid, error.stack);
    });
    
    function _deDuplication(pushId, devices, callback){
        // TODO de-duplication
        var multi = redisMananger.write('push').multi();
        var redisKey = 'push:status:hash:'+pushId;

        for( var i = 0; i < devices.length; i++ ) {
            multi.sadd(redisKey, devices[i]);
        }

        multi.exec(function (err, result) {
            devices = devices.filter(function (v, i) {
                return result[i] === 1;
            });

            callback(err, devices);
        });
    };

})();