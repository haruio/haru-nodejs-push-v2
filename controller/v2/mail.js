/**
 * Created by syntaxfish on 15. 7. 23..
 */
var mailPublisher = require('../../lib/mailPublisher');
var mailAssociations = require('../../lib/mailAssociations');

var config = require('config');

exports.signup = function(req, res) {
    var body = req.body;
    if(!body.to) { return res.json({message: "fail"}); }
    if(!Array.isArray(body.to)) { body.to = [body.to]; }

    mailPublisher.send({
        from: body.from || config.get('Message.mail.signup.from'),
        to: body.to || undefined,
        text: body.text || config.get('Message.mail.signup.text'),
        html: body.html || config.get('Message.mail.signup.html'),
        subject: body.subject || config.get('Message.mail.signup.subject'),
        type: 'signup'
    }, function (err, json) {
        res.json(json);
    });

};

exports.withdraw = function(req, res) {
    var body = req.body;
    if(!body.to) { return res.json({message: "fail"}); }
    if(!Array.isArray(body.to)) { body.to = [body.to]; }

    mailPublisher.send({
        from: body.from || config.get('Message.mail.withdraw.from'),
        to: body.to || undefined,
        text: body.text || config.get('Message.mail.withdraw.text'),
        html: body.html || config.get('Message.mail.withdraw.html'),
        subject: body.subject || config.get('Message.mail.withdraw.subject'),
        type: 'withdraw'
    }, function (err, json) {
        res.json(json);
    });
};

exports.resetpassword = function(req, res) {
    var body = req.body;
    if(!body.to) { return res.json({message: "fail"}); }
    if(!Array.isArray(body.to)) { body.to = [body.to]; }

    mailPublisher.send({
        from: body.from || config.get('Message.mail.resetpassword.from'),
        to: body.to || undefined,
        text: body.text || config.get('Message.mail.resetpassword.text'),
        html: body.html || config.get('Message.mail.resetpassword.html'),
        subject: body.subject || config.get('Message.mail.resetpassword.subject'),
        type: 'resetpassword'
    }, function (err, json) {
        res.json(json);
    });
};

exports.send = function(req, res) {
    var body = req.body;
    if(!body.to) { return res.json({message: "fail"}); }
    if(!Array.isArray(body.to)) { body.to = [body.to]; }

    if(body.publishTime) {
        mailPublisher.reservation(body, function (err, msg) {
            res.json(msg);
        });
    } else {
        mailPublisher.send({
            from: body.from || config.get('Message.mail.default.from'),
            to: body.to || undefined,
            text: body.text || config.get('Message.mail.default.text'),
            html: body.html || config.get('Message.mail.default.html'),
            subject: body.subject || config.get('Message.mail.default.subject')
        }, function (err, json) {
            res.json(json);
        });
    }
};

exports.read = function (req, res){
    var skip = req.query.skip || 0;
    var limit = req.query.limit || 10;

    mailAssociations.getMail(req.query, skip, limit, function(err, result) {
        res.json(result);
    });
};

exports.cancel = function(req, res, next) {
    var id = req.params.id;
    mailAssociations.cancelScheduledMail(id, function(err, result) {
        if(!result) { return next(new Error("INVALID_MAIL_ID")); }

        res.json({
            mailId: id
        });
    });
};

exports.update = function(req, res, next) {
    var id = req.params.id;
    var body = req.body;

    mailAssociations.updateScheduledMail(id, body, function(err, result) {
        if(!result) { return next(new Error("INVALID_MAIL_ID")); }

        res.json({
            mailId: id
        });
    });
};
