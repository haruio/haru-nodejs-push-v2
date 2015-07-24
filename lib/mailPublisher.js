/**
 * Created by syntaxfish on 15. 7. 24..
 */

module.exports = (function() {
    "use strict";

    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;
    var config = require('config');

    
    function EmailPublisher() {
        this.sendgrid = require('sendgrid')(config.get("Mail.apiKey"));
        this.template = require('./mailTemplate');

        EventEmitter.call(this);
    };

    inherits(EmailPublisher, EventEmitter);

    EmailPublisher.prototype.send = function(payload, callback) {
        var self = this;

        self._buildMail(payload, function(err, email) {
            if(err) { return callback(err); }

            self.sendgrid.send(email, callback);
        });
    };

    EmailPublisher.prototype._buildMail = function(payload, callback) {
        var self = this;
        var email = new self.sendgrid.Email();
        var template = self.template[payload.type];

        if(template) {
            email.setFilters({
                'templates': {
                    'settings': {
                        'enable': 1,
                        'template_id' : template
                    }
                }
            });
        }

        payload.to.forEach(function (to) {
            email.addTo(to);
        });

        email.subject = payload.subject; // 제목
        email.from = payload.from;

        email.text = payload.text; // PARAM plain
        email.html = payload.html; // PARAM html

        callback(null, email);
    };

    return new EmailPublisher();
})();

