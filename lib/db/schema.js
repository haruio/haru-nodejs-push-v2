/**
 * Created by Asterisk on 3/13/15.
 */

var Schema = require('mongoose').Schema;

exports.UserDevice = new Schema({
  rtcId: {type: Number, index: true},
  user: {type: Schema.Types.ObjectId, index: true},
  pushType: {type: String, enum: ['MQTT', 'GCM', 'APN'], index: true},
  uuid: {type: String, index: true},
  deviceToken: {type: String},
  deviceType: {type: String, enum: ['IOS', 'ANDROID']},
  deviceVersion: {type: String},
  device: {type: String},
  appVersion: {type: String},
  timeZone: {Type: String},
  nation: {Type: String},
  channels: [{type: Schema.Types.ObjectId, index: true}],
  createdAt: {type: Date},
  updatedAt: {type: Date}
});

exports.Push = new Schema({
  message: {type: Schema.Types.Mixed},
  condition: {type: Schema.Types.Mixed},
  type: {type: String, enum: ['all', 'channel', 'user', 'inbox', 'etc', 'test'], index: true},
  createdBy: {type: String},
  createdAt: {type: Date},

  sendCount: {type: Number},
  startedAt: {type: Date},
  finishedAt: {type: Date},
  timezone: {type: String}

});

exports.ScheduledPush = new Schema({
  condition: {type: Schema.Types.Mixed},
  type: {type: String, enum: ['all', 'channel', 'user', 'inbox', 'etc', 'test'], index: true},

  message: {type: Schema.Types.Mixed},
  options: {type: Schema.Types.Mixed},
  data: {type: Schema.Types.Mixed},

  timezone: {type: String},

  gcm: {type: Schema.Types.Mixed},
  apn: {type: Schema.Types.Mixed},
  createdBy: {type: String},
  createdAt: {type: Date},
  status: {type: String, enum: ['waiting', 'approved', 'published', 'canceled'], index: true},
  scheduledAt: {type: Date},
  pushTime: {type: Date}
});

exports.PushStatus = new Schema({
  push: {type: Schema.Types.ObjectId, ref: 'Pushes', index: true},
  uuid: {type: String, index: true},
  status: {type: String, enum: ['failed', 'sended', 'received', 'opened'], index: true},
  retry: {type: Number},
  sendedAt: {type: Date},
  receivedAt: {type: Date},
  openedAt: {type: Date}
});

exports.PushException = new Schema({
  uuid: {type: String, index: true},
  exception: {type: String},
  createdAt: {type: Date}
});
