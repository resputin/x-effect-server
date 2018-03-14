'use strict';

const mongoose = require('mongoose');

const { Card } = require('../models/card');
const { CardEvent } = require('../models/card-event');
const seedEvents = require('../db/seed/cardEvents');
const seedCards = require('../db/seed/cards');
const { MONGODB_URI } = require('../config');
// Put in mongo db uri here once its created
mongoose
  .connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => Card.insertMany(seedCards))
  .then(() => CardEvent.insertMany(seedEvents))
  .then(() => Card.ensureIndexes())
  .then(() => CardEvent.ensureIndexes())
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });