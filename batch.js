/**
 * Created by syntaxfish on 15. 7. 7..
 */
(function() {
    "use strict";
    var pushAssociations = require('./lib/PushAssociations');
    var async = require('async');
    var pushPublisher = require('./lib/pushPublisher');

    var notificationAssociations = require('./lib/notificationAssociations');
    var notificationPublisher = require('./lib/notificationPublisher');

    async.waterfall([
        function findNotification(callback){
            notificationAssociations.getReservedPush(callback);
        },
        function publishNotification(jobs, callback){
            async.times(jobs.length, function(n, next) {
                var notification = jobs[n];
                notificationPublisher.publishReservedPush(notification, callback);
            },function done(error, results) {
                callback();
            });
        }
    ], function done(error, results) {
        process.exit(1);
    });
})();