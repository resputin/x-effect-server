'use strict';

const express = require('express');
// Create an router instance (aka "mini-router")
const router = express.Router();
const { CardEvent } = require('../models/card-event');
const passport = require('passport');
router.use(passport.authenticate('jwt', { session: false, failWithError: true }));

router.put('/:id', (req, res, next) => {
  CardEvent.findByIdAndUpdate(req.body.id, {status: req.body.status}, {new: true})
    .then(response => {
      if (response) {
        res.json(response);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

module.exports = router;
