'use strict';

const mongoose = require('mongoose');

const cardEventSchema = mongoose.Schema({
  status: {type: String, default: 'NOT_CHECKED'},
  expires: Date,
  cardId: {type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true}
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