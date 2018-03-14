'use strict';

const express = require('express');
// Create an router instance (aka "mini-router")
const router = express.Router();
const { Card } = require('../models/card');
const { CardEvent } = require('../models/card-event');
const mongoose = require('mongoose');
const moment = require('moment');

router.get('/', (req, res, next) => {
  Card.find().populate('cardEvents')
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
    name: req.body.name
  };

  Card.create(newCard)
    .then(response => {
      const created = moment(response.created);
      const cardId = response.id;
      const eventPromises = [];
      for (let i = 0; i < 49; i++) {
        eventPromises.push(
          CardEvent.create({
            cardId,
            expires: created.startOf('day').add(1, 'days')
          })
        );
      }
      return Promise.all(eventPromises);
    })
    .then(response => {
      let eventIds = response.map(event => event.id);
      console.log(eventIds);
      return Card.findByIdAndUpdate(response[0].cardId, {cardEvents: eventIds});
    })
    .then(response => {
      console.log(response);
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

router.put('/:id', (req, res, next) => {
  if (req.body.id !== req.params.id) {
    const err = new Error('Id must match in body and url params');
    err.status = 400;
    return next(err);
  }

  const acceptedFields = ['name'];
  const updateCard = {};
  for (let field in acceptedFields) {
    if (req.body[field]) {
      updateCard[field] = req.body[field];
    }
  }

  if (req.body.xArray) {
    Card.findById(req.params.id)
      .then(response => {
        updateCard.xArray = [...response.xArray, req.body.xArray];
        console.log(updateCard);
        return Card.findByIdAndUpdate(req.params.id, updateCard, { new: true });
      })
      .then(response => {
        console.log(response);
        if (response) {
          res.json(response);
        } else {
          console.log('here');
          next();
        }
      })
      .catch(next);
  } else {
    Card.findByIdAndUpdate(req.params.id, updateCard, { new: true })
      .then(response => {
        if (response) {
          res.json(response);
        } else {
          next();
        }
      })
      .catch(next);
  }
});

module.exports = router;
