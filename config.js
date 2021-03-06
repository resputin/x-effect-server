'use strict';

exports.MONGODB_URI = 'mongodb://localhost/x-effect';
exports.TEST_MONGODB_URI =
  process.env.TEST_MONGODB_URI || 'mongodb://localhost/x-effect-test';
exports.PORT = 8080;
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
