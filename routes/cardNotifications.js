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

router.post('/', (req, res, next) => {
  CardEvent.find({ cardId: req.body.cardId })
    .then(response => {
      const notifications = [];
      response.forEach(event => {
        console.log('Expires',event.expires, 'send', moment(event.expires).subtract(req.body.sendTime, 'minutes'), 'passed in minutes', req.body.sendTime);
        notifications.push(CardNotification.create({
          sendTime: moment(event.expires).subtract(req.body.sendTime, 'minutes'),
          sendTo: req.body.sendTo,
          cardId: event.cardId,
          userId: req.user.id,
          cardEventId: event.id,
          body: req.body.message
        }));
      });
      return Promise.all(notifications);
    })
    .then(() => {
      return Card.update({ _id: req.body.cardId }, { notificationsEnabled: true }, { new: true });
    })
    .then(response => {
      res.json(response);
    });
});

router.delete('/:id', (req, res, next) => {
  CardNotification.deleteMany({ cardId: req.params.id })
    .then(() => {
      return Card.update({_id: req.params.id}, { notificationsEnabled: false });
    })
    .then(response => res.json(response));
});

module.exports = router;
