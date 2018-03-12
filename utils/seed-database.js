'use strict';

const mongoose = require('mongoose');

const { Card } = require('../models/card');
const seedCards = require('../db/seed/cards');
const { MONGODB_URI } = require('../config');
// Put in mongo db uri here once its created
mongoose.connect(MONGODB_URI)
  .then(() => Card.insertMany(seedCards))
  .then(() => Card.ensureIndexes())
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });