/**
 * Created by syntaxfish on 15. 7. 6..
 */
"use strict";
var pushAssociations = require('../../lib/PushAssociations');

exports.pushCnt = function(req, res) {
    pushAssociations.countPushes({}, function(err, count) {
        res.json({count: count});
    });
    pushAssociations.countPushes();
};

exports.pushes = function(req, res) {
    var skip = req.query.skip | 0;
    var limit = req.query.limit | 10;

    pushAssociations.getPushes(req.query, skip, limit, function(err, result) {
        res.json(result);
    });
};

exports.deviceCnt = function(req, res) {
    pushAssociations.countDevices({}, function(err, count) {
        res.json({count: count});
    });
};

exports.reservation = function(req, res) {
    var skip = req.query.skip | 0;
    var limit = req.query.limit | 10;

    pushAssociations.getTotalScheduledPushes(req.query, skip, limit, function(err, result) {
        res.json(result);
    });

};

