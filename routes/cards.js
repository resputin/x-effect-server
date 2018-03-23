'use strict';

const express = require('express');
const router = express.Router();
const { Card } = require('../models/card');
const { CardEvent } = require('../models/card-event');
const moment = require('moment');
const passport = require('passport');

/**
 * Router uses JWT to protect all endpoints here.
 */
router.use(
  passport.authenticate('jwt', { session: false, failWithError: true })
);

router.get('/', (req, res, next) => {
  Card.find({ userId: req.user.id })
    .populate('cardEvents')
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      next(err);
    });
});

router.post('/', (req, res, next) => {
  if (!req.body.name) {
    const err = new Error('Must include name');
    err.status = 400;
    return next(err);
  }

  const newCard = {
    name: req.body.name,
    userId: req.user.id,
    created: req.body.created
  };

  /**
   * Card gets created and then this creation will also create all of the CardEvents
   * that accompany this card. Look at models for more information on how this works.
   * A lot of work to create multiple things and properly set up references to all the
   * other models.
   */
  Card.create(newCard)
    .then(response => {
      const created = moment(response.created).startOf('day');
      const cardId = response.id;
      const eventPromises = [];
      for (let i = 0; i < 49; i++) {
        eventPromises.push(
          CardEvent.create({
            cardId,
            expires: created.add(1, 'days')
          })
        );
      }
      return Promise.all(eventPromises);
    })
    .then(response => {
      let eventIds = response.map(event => event.id);
      return Card.findByIdAndUpdate(response[0].cardId, {
        cardEvents: eventIds
      });
    })
    .then(response => {
      if (response) {
        return Card.findById(response.id).populate('cardEvents');
      } else {
        next();
      }
    })
    .then(response => {
      res.status(201).json(response);
    })
    .catch(next);
});

module.exports = router;
