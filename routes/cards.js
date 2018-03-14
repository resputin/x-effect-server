'use strict';

const express = require('express');
// Create an router instance (aka "mini-router")
const router = express.Router();
const { Card } = require('../models/card');
const { Event } = require('../models/event');
const mongoose = require('mongoose');

router.get('/api', (req, res, next) => {
  Card.find()
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      next(err);
    });
});

router.post('/api/cards', (req, res, next) => {
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
      if (response) {
        res.json(response);
      } else {
        next();
      }
    })
    .catch(next);
});

router.put('/api/cards/:id', (req, res, next) => {
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