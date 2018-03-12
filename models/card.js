'use strict';

const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
  name: { type: String, required: true },
  created: { type: Date, default: Date.now() },
  xArray: { type: Array, default: [] }
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