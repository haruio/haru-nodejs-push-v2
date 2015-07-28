/**
 * Created by syntaxfish on 15. 7. 28..
 */
(function() {
    "use strict";
    var mailAssociations = require('./lib/MailAssociations');
    var mailPublisher = require('./lib/mailPublisher');

    var async = require('async');

    async.waterfall([
        function findScheduledMail(callback){
            mailAssociations.getScheduledMail(callback);
        },
        function publishMail(jobs, callback){
            async.times(jobs.length, function(n, next) {
                var mail = jobs[n];
                mailPublisher.send(mail, next);
            }, callback);
        }
    ], function done(error, results) {
        process.exit(1);
    });

})();


