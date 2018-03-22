'use strict';

const mongoose = require('mongoose');

const cardNotificationSchema = mongoose.Schema({
  status: { type: String, default: 'NOT_SENT' },
  sendTime: Date,
  sendTo: { type: String, required: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cardEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CardEvent',
    required: true
  },
  body: { type: String, required: true }
});

cardNotificationSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const CardNotification = mongoose.model('CardNotification', cardNotificationSchema);
module.exports = { CardNotification };
