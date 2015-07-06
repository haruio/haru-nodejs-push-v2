/**
 * Created by syntaxfish on 15. 7. 6..
 */
"use strict";
var pushAssociations = require('../../lib/PushAssociations');

exports.sub = function(req, res, next) {
    var deviceInfo = req.body;

    pushAssociations.addDevice(deviceInfo, function(err) {
        if (err) {
            next(err);
        } else {
            res.json({uuid: req.body.uuid});
        }
    });
};

exports.update = function(req, res, next) {
    var uuid = req.body.uuid;

    pushAssociations.addDevice(req.body, function(err, result) {
        if (err || !result) {
            res.status(404).send();
        } else {
            res.json({uuid: uuid});
        }
    });
};

exports.unsub = function(req, res, next) {
    var data = req.body;

    if (data.uuid) {
        pushAssociations.removeByUuid(data.uuid, function(err) {
            if (err) {
                next(err);
            } else {
                res.status(204).send();
            }
        });
    } else if (data.deviceToken) {
        pushAssociations.removeDevice(data.deviceToken, function(err) {
            if (err) {
                next(err);
            } else {
                res.status(204).send();
            }
        });
    } else {
        res.status(503).send();
    }
};

exports.registerUser = function(req, res, next) {
    var uuid = req.body.uuid;
    pushAssociations.registerUser(uuid, req.body.user, function(err, result) {
        if (err) {
            next(err);
        } else {
            res.json({uuid: uuid});
        }
    });
};

exports.unregisterUser = function(req, res, next) {
    var uuid = req.body.uuid;
    pushAssociations.registerUser(uuid, undefined, function(err, result) {
        if (err) {
            next(err);
        } else {
            res.json({uuid: uuid});
        }
    });
};

exports.validate = function(fields) {
    return function(req, res, next) {
        fields.forEach(function(field) {
            if (!req.body.hasOwnProperty(field)) {
                var err = new Error();
                err.message = 'INVALID_VALUE';
                err.field = field;
                err.errorCode = 400;
                return next(err);
            }
        });
        return next();
    };
};

exports.registerChannels = function(req, res, next) {
    var user = req.body.user;
    var channels = req.body.channels;

    pushAssociations.registerChannels(user, channels, function(err, result) {
        if (err) {
            next(err);
        } else {
            if (result && result.uuid) {
                res.json({uuid: result.uuid});
            } else {
                console.error(result);
                res.json({});
            }
        }
    });
};

exports.unregisterChannels = function(req, res, next) {
    var user = req.body.user;
    var channels = req.body.channels;

    pushAssociations.unregisterChannels(user, channels, function(err, result) {
        if (err) {
            next(err);
        } else {
            if (result && result.uuid) {
                res.json({uuid: result.uuid});
            } else {
                console.error(result);
                res.json({});
            }
        }
    });
};