'use strict';
const mongoose = require('mongoose');

/**
 * Cards are the main component of the X Effect. Cards contain 49 CardEvents that can be 
 * checked off with an X or missed with an O. Each of these days are contained in an individual
 * CardEvent that populates its data back up to the card model.
 * 
 * Card Model:
 *  Name:                 Name of card
 *  Created:              Date created, this date is used to calculate when the card events
 *                        expire. More info on CardEvent model
 *  UserId:               UserID of the user that created this card
 *  CardEvents:           Array of CardEvent Id's that are associated with this card. These
 *                        are created when the card is created.
 *  NotificationsEnabled: Boolean for whether there are notifications turned on for this card.
 */
const cardSchema = mongoose.Schema({
  name: { type: String, required: true },
  created: { type: Date, default: Date.now() },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cardEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CardEvent' }],
  notificationsEnabled: { type: Boolean, default: false }
});

cardSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Card = mongoose.model('Card', cardSchema);
module.exports = { Card };
