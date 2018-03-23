'use strict';

const express = require('express');
const router = express.Router();
const { CardEvent } = require('../models/card-event');
const { CardNotification } = require('../models/card-notification');
const { Card } = require('../models/card');
const passport = require('passport');
const moment = require('moment');
router.use(
  passport.authenticate('jwt', { session: false, failWithError: true })
);

/**
 * Notifications take a lot of information into create. Some of this isn't necessary
 * right now but it is a little future proof to account for additional things that
 * might get added. The most important thing here is that the creation uses moment to
 * determine when the notification should be sent by subtracting the offset in minutes
 * by the time from when it expires.
 */
router.post('/', (req, res, next) => {
  CardEvent.find({ cardId: req.body.cardId })
    .then(response => {
      const notifications = [];
      response.forEach(event => {
        notifications.push(
          CardNotification.create({
            sendTime: moment(event.expires).subtract(
              req.body.sendTime,
              'minutes'
            ),
            sendTo: req.body.sendTo,
            cardId: event.cardId,
            userId: req.user.id,
            cardEventId: event.id,
            body: req.body.message
          })
        );
      });
      return Promise.all(notifications);
    })
    .then(() => {
      return Card.update(
        { _id: req.body.cardId },
        { notificationsEnabled: true },
        { new: true }
      );
    })
    .then(response => {
      res.json(response);
    });
});

/**
 * This takes a card Id as a param and uses that to delete all associated notifications.
 */
router.delete('/:id', (req, res, next) => {
  CardNotification.deleteMany({ cardId: req.params.id })
    .then(() => {
      return Card.update(
        { _id: req.params.id },
        { notificationsEnabled: false }
      );
    })
    .then(response => res.json(response));
});

module.exports = router;
