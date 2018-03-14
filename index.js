'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const { Card } = require('./models/card');
const mongoose = require('mongoose');
const { MONGODB_URI, PORT, CLIENT_ORIGIN } = require('./config');
const cardRouter = require('./routes/cards');

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use(express.json());

app.use('/', cardRouter);

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use(function(err, req, res, next) {
  console.log('getting here for some reason');
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

if (require.main === module) {
  mongoose
    .connect(MONGODB_URI)
    .then(instance => {
      const conn = instance.connections[0];
      console.info(
        `Connected to: mongodb://${conn.host}:${conn.port}/${conn.name}`
      );
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error('\n === Did you remember to start `mongod`? === \n');
      console.error(err);
    });

  app
    .listen(PORT, function() {
      console.info(`Server listening on ${this.address().port}`);
    })
    .on('error', err => {
      console.error(err);
    });
}

/**
 * start timer loop with setInterval after app starts up
 * setInterval on a short timer to check buisness logic
 * 
 * card: {
 *  name:
 *  createdAt:
 *  xArray: [true, false, true, undecided] => [true, false, true, false, undecided]
 *  hasNotChecked: true
 * }
 * 
 * get all events, that expire today, and are undecided
 * get all events for a card
 * 
 * notification tied to this same event add needsNotification
 * 
 * "NOT_CHECKED"
 * "MISSED"
 * "COMPLETED"
 */
