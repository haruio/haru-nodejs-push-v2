/**
 * Created by syntaxfish on 15. 7. 23..
 */
var mailPublisher = require('../../lib/mailPublisher');


exports.signup = function(req, res) {
    var body = req.body;

    mailPublisher.sendTemplate({
        from: body.from || undefined,
        to: body.to || undefined,
        text: body.text || undefined,
        html: body.html || undefined,
        subject: body.subject || undefined,
        type: 'signup'
    }, function (err, json) {
        console.log(err, json);

        res.json(json);
    });

};

exports.withdraw = function(req, res) {
    var body = req.body;

    mailPublisher.sendTemplate({
        from: body.from || undefined,
        to: body.to || undefined,
        text: body.text || undefined,
        html: body.html || undefined,
        subject: body.subject || undefined,
        type: 'withdraw'
    }, function (err, json) {
        res.json(json);
    });
};

exports.resetpassword = function(req, res) {
    var body = req.body;

    mailPublisher.sendTemplate({
        from: body.from || undefined,
        to: body.to || undefined,
        text: body.text || undefined,
        html: body.html || undefined,
        subject: body.subject || undefined,
        type: 'resetpassword'
    }, function (err, json) {
        res.json(json);
    });
};


