'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model:
 *  Email: works as the username so it must be unique
 *  Name: Currently unused but will be required for additional
 *        features
 *  Password: Hash created by bcrypt
 */
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true }
});

userSchema.set('toObject', {
  transform: function(doc, ret) {
    delete ret.password;
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('USer', userSchema);

module.exports = { User };
