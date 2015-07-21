/**
 * Created by syntaxfish on 15. 7. 7..
 */
(function() {
    "use strict";
    var pushAssociations = require('./lib/PushAssociations');
    var async = require('async');
    var pushPublisher = require('./lib/pushPublisher');


    async.waterfall([
        function findNotification(callback){
            pushAssociations.getScheduledPushes('approved', callback);
        },
        function publishNotification(jobs, callback){
            async.times(jobs.length, function(n, next) {
                var notification = jobs[n];
                pushPublisher.publish(notification, function (err, publishedPush) {
                    //pushAssociations.changeScheduledPushStatus(notification._id, 'published', next);
                    pushAssociations.updateSchedulePush(notification._id, {status: 'published', pushId: publishedPush.pushId}, next);
                });
            },function done(error, results) {
                callback();
            });
        }
    ], function done(error, results) {
        process.exit(1);
    });
})();