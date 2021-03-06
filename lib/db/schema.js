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
  data: {type: Schema.Types.Mixed},
  condition: {type: Schema.Types.Mixed},
  type: {type: String, enum: ['all', 'channel', 'user', 'inbox', 'etc', 'test'], index: true},
  createdBy: {type: String},
  createdAt: {type: Date},

  sendCount: {type: Number},
  startedAt: {type: Date},
  finishedAt: {type: Date},
  timezone: {type: String},

  extra: {type: Schema.Types.Mixed}
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
  pushTime: {type: Date},

  pushId: {type: Schema.Types.ObjectId},
  extra: {type: Schema.Types.Mixed}
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

exports.Mail = new Schema({
  subject:      {type: String},
  from:         {type: String},
  to:           [{type: String}],
  text:         {type: String},
  html:         {type: String},

  createdBy:    {type: String},
  createdAt:    {type: Date, default: Date.now},

  updatedBy:    {type: String},
  updatedAt:    {type: Date, default: Date.now},

  sendCount:    {type: Number},
  viewCount:    {type: Number, default: 0},

  status:       {type: String, enum: ['waiting', 'approved', 'published', 'canceled'], index: true},

  timezone:     {type: String},
  publishTime:  {type: Date}
});


exports.Push2 = new Schema({
    // 조건들
    channels:[{type: String}],
    sendType: {type: String, enum: ['Everyone', 'Channels', 'Unique', 'Segments'], index: true},//'Everyone',
    deviceType: {type: String, enum: ['ALL', 'ANDROID', 'IOS'], index: true}, // [ALL, ANDROID, IOS]
    condition: {type: Schema.Types.Mixed},
    segments: {type: Schema.Types.Mixed},
    deviceTokens: [{type: String}],

    // payload
    link: {type: String},
    pushLinkUrl: {type: String},
    payload: {type: Schema.Types.Mixed},

    // 시간
    timezone: {type: String},
    createdBy: {type: String},
    createdAt: {type: Date, default: Date.now},
    updatedBy: {type: String},
    updatedAt: {type: Date, default: Date.now},
    publishTime: {type: Date, default: Date.now},
    startedAt: {type: Date},
    finishedAt: {type: Date},

    // 집계
    sendCount: {type: Number},
    openCount:    {type: Number, default: 0},
    receiveCount:    {type: Number, default: 0},

    // 상태
    status: {type: String, enum: ['waiting', 'approved', 'published', 'canceled'], index: true, default: 'waiting'}
});