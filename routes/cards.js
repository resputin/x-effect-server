'use strict';

const express = require('express');
// Create an router instance (aka "mini-router")
const router = express.Router();
const { Card } = require('../models/card');
const { CardEvent } = require('../models/card-event');
const moment = require('moment');
const passport = require('passport');

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
    userId: req.user.id
  };

  Card.create(newCard)
    .then(response => {
      const created = moment(response.created)
        .startOf('day');
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

// router.put('/:id', (req, res, next) => {
//   if (req.body.id !== req.params.id) {
//     const err = new Error('Id must match in body and url params');
//     err.status = 400;
//     return next(err);
//   }

//   const acceptedFields = ['name'];
//   const updateCard = {};
//   for (let field in acceptedFields) {
//     if (req.body[field]) {
//       updateCard[field] = req.body[field];
//     }
//   }
  
//   Card.findByIdAndUpdate(req.params.id, updateCard, { new: true })
//     .then(response => {
//       if (response) {
//         res.json(response);
//       } else {
//         next();
//       }
//     })
//     .catch(next);
// });

module.exports = router;
