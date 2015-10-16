/**
 * Created by syntaxfish on 15. 6. 27..
 */
module.exports = (function() {
	"use strict";
	var EventEmitter = require('events').EventEmitter;
	var inherits = require('util').inherits;
	var apn = require('apn');
	var config = require('config');

	function ApnsProvider(settings) {
		settings = settings || config.get('Push.APN');
		var pushOptions = settings.pushOptions || config.get('Push.APN.pushOptions');
		var feedbackOptions = settings.feedbackOptions || config.get('Push.APN.feedbackOptions');

		if(settings.certData) {
			pushOptions.cert = pushOptions.certData || settings.certData;
			feedbackOptions.cert = feedbackOptions.certData || settings.certData;
		}

		if(settings.keyData) {
			pushOptions.key = pushOptions.keyData || settings.keyData;
			feedbackOptions.key = feedbackOptions.keyData || settings.keyData;
		}

		this.pushOptions = pushOptions;
		this.feedbackOptions = feedbackOptions;

		this._setupPushConnection(pushOptions);
		this._setupFeedback(feedbackOptions);

		this.on('error', function (err) {
			console.log(err);
		});

		EventEmitter.call(this);
	};

	inherits(ApnsProvider, EventEmitter);


	ApnsProvider.prototype._setupPushConnection = function(options) {
		var self = this;
		if(options && !options.port){
			delete options.port;
		}

		var connection = new apn.Connection(options);

		function errorHandler(err) {
			self.emit('error', err);
		}

		connection.on('error', errorHandler);
		connection.on('socketError', errorHandler);

		connection.on('transmissionError', function(code, notification, recipient) {
			var err = new Error('Cannot send APNS notification: ' + code);
			self.emit(err, notification, recipient);
		});

		this._connection = connection;
	};

	ApnsProvider.prototype._setupFeedback = function(options) {
		var self = this;

		this._feedback = new apn.Feedback(options);
		this._feedback.on('feedback', function (devices) {
			self.emit('devicesGone', devices);
		});
	};

	ApnsProvider.prototype.pushNotification = function(devices, payload) {
		var message = _buildMessage(payload);

		this._connection.pushNotification(message, devices);
	};

	function _buildMessage(payload){
		var message = new apn.Notification();
		var options = payload.options || {};

		message.expiry = options.expiry || config.get('Push.APN.messageOptions.expiry');
		message.badge = options.badge;
		message.sound = options.sound;
		message.alert = options.alert;
		message.payload = {
			aps: {
				alert: payload.message.title
			}
		};

		Object.keys(payload).forEach(function (key) {
			message.payload[key] = payload[key];
		});

		return message;
	};

	return ApnsProvider;
})();