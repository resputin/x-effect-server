'use strict';

const express = require('express');
const router = express.Router();
const { CardEvent } = require('../models/card-event');
const { CardNotification } = require('../models/card-notification');
const passport = require('passport');
const moment = require('moment');
router.use(
  passport.authenticate('jwt', { session: false, failWithError: true })
);

router.post('/', (req, res, next) => {
  CardEvent.find({ cardId: req.body.cardId })
    .then(response => {
      const notifications = [];
      response.forEach(event => {
        notifications.push(CardNotification.create({
          sendTime: moment(event.expires).subtract(req.body.minutesUntilExpire, 'minutes'),
          sendTo: req.body.sendTo,
          cardId: event.cardId,
          userId: req.user.id,
          cardEventId: event.id,
          body: 'You still haven\'t checked off your card for today'
        }));
      });
      return Promise.all(notifications);
    })
    .then(response => {
      res.json(response);
    });
});

module.exports = router;
