'use strict';

const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  status: {type: String, default: 'NOT_CHECKED'},
  expires: Date,
  cardId: {type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true}
});

eventSchema.set('toObject', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Event = mongoose.model('Event', eventSchema);
module.exports = { Event };