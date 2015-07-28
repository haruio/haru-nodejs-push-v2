/**
 * Created by syntaxfish on 15. 7. 28..
 */

module.exports = (function() {
    "use strict";

    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;
    var mongoose = require('mongoose');
    var schema = require('./db/schema');
    var config = require('config');

    function MailAssociations() {
        var db = this.db = mongoose.createConnection(config.get('Moncast.mongodb.host'));
        this.Mail = db.model('Mail', schema.Mail);

        EventEmitter.call(this);
    };

    inherits(MailAssociations, EventEmitter);

    MailAssociations.prototype.saveMail = function(mail, callback) {
        var self = this;

        if(!mail.publishTime) { mail.publishTime = new Date().getTime(); }
        if(!mail.timezone) { mail.timezone = 'Asia/Seoul'; }
        if(!mail.status) { mail.status = 'published'; }
        if(!mail.sendCount) { mail.sendCount = mail.to.length; }

        self.Mail(mail).save(callback);
    };
    
    MailAssociations.prototype.getScheduledMail = function(callback) {
        var query = {
            publishTime: {$lt: new Date().getTime()},
            status: 'approved'
        };

        this.Mail.find(query)
            .lean()
            .sort({publishTime: -1})
            .exec(callback);
    };
    
    MailAssociations.prototype.getMail = function(condition, skip, limit, callback) {
        if(condition.limit) {
            delete condition.limit;
        }
        if(condition.skip) {
            delete condition.skip;
        }

        this.Mail.find(condition)
            .skip(skip)
            .limit(limit)
            .lean()
            .sort({createdAt: -1})
            .exec(function (err, result) {
                callback(err, result);
            });
    };
    
    MailAssociations.prototype.cancelScheduledMail = function(id, callback) {
        this.Mail.findOneAndUpdate({_id: id, status: 'approved'}, {status: 'canceled'}, callback);
    };
    MailAssociations.prototype.updateStatusMail = function(id, status, callback) {
        this.Mail.findOneAndUpdate({_id: id}, {status: status}, callback);
    };
    
    MailAssociations.prototype.updateScheduledMail = function(id, body, callback) {
        body.status = 'approved';

        this.Mail.findOneAndUpdate({_id: id, status: {$in: ['canceled', 'approved']}},{$set: body}, callback);
    };


    return new MailAssociations();
})();