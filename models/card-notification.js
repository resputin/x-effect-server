'use strict';
const mongoose = require('mongoose');

/**
 * Notifications for cards, this model interacts with the Twilio API to send SMS notifications
 * to users that have signed up individual cards to receive notifications. The user specifies
 * what number to send it to, the notification message that gets sent, and what time the
 * notification will send if it has not been completed yet.
 * 
 * CardNotification Model:
 *  Status:       Defaults to NOT_SENT and then will change to SENT once notification has 
 *                sent successfully
 *  SendTime:     When the notification will send
 *  SendTo:       Used for Twilio API, determines what phone number to send an SMS to
 *  CardId:       The ID of the card associated with this notification
 *  UserId:       The ID of the user associated with this notification, not currently used but
 *                available for extension features
 *  CardEventId:  The card event that this notification is tied to. The notification will only 
 *                send if the Event is marked as 'NOT_COMPLETED'
 */
const cardNotificationSchema = mongoose.Schema({
  status: { type: String, default: 'NOT_SENT' },
  sendTime: Date,
  sendTo: { type: String, required: true },
  cardId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Card', 
    required: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true },
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

const CardNotification = mongoose.model(
  'CardNotification',
  cardNotificationSchema
);
module.exports = { CardNotification };
