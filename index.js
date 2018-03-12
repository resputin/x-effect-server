'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const { Card } = require('./models/card');
const mongoose = require('mongoose');
const { MONGODB_URI, PORT, CLIENT_ORIGIN } = require('./config');

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

app.get('/', (req, res, next) => {
  Card.find()
    .then(response => {
      res.json(response);
    })
    .catch(err => {
      next(err);
    });
});

app.post('/cards', (req, res, next) => {
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

app.put('/cards/:id', (req, res, next) => {
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
