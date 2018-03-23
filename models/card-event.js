'use strict';
const mongoose = require('mongoose');

/**
 * CardEvents are the individual day objects that make up most of the cards data.
 * They contain when the event expires so that the interval that runs on the server
 * can modify the status without user input.
 *
 * CardEvent Schema:
 *  Status:   Defaults to 'NOT_CHECKED', when the user checks off this event it gets
 *            changed to 'COMPLETE', or when it's missed to 'MISSED'
 *  Expires:  When this event expires. The server queries to check if the expiration is
 *            less than the current time and will change its status to 'MISSED'
 *  CardId:   What card this event is attached to
 */
const cardEventSchema = mongoose.Schema({
  status: { type: String, default: 'NOT_CHECKED' },
  expires: Date,
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true }
});

cardEventSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const CardEvent = mongoose.model('CardEvent', cardEventSchema);
module.exports = { CardEvent };
