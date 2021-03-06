'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const passport = require('passport');
const mongoose = require('mongoose');
const { MONGODB_URI, PORT, CLIENT_ORIGIN } = require('./config');

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

// Use cors to only allow client to access API
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// Using local strategy for initial log in and JWT for persistence
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(express.json());

const cardRouter = require('./routes/cards');
const cardEventRouter = require('./routes/cardEvents');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const notificationRouter = require('./routes/cardNotifications');

app.use('/api', usersRouter);
app.use('/api', authRouter);

app.use('/api/cards', cardRouter);
app.use('/api/cardEvents', cardEventRouter);
app.use('/api/notifications', notificationRouter);

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

const checkExpiration = require('./models/helpers/card-event-helper');
const sendNotifications = require('./models/helpers/twilio-helper');

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

  /**
   * The interval timer here will run once every 5 minutes and check if a card has expired.
   * It also will check to see if there are any notifications that need to be sent.
   */
  app
    .listen(PORT, function() {
      setInterval(() => {
        checkExpiration();
        sendNotifications();
      }, 5000 * 60);
      console.info(`Server listening on ${this.address().port}`);
    })
    .on('error', err => {
      console.error(err);
    });
}

module.exports = app;
