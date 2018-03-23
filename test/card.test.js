'use strict';
const express = require('express');
const app = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSpies = require('chai-spies');
const expect = chai.expect;
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);
chai.use(chaiSpies);

const mongoose = require('mongoose');
const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');
const { Card } = require('../models/card');
const { CardEvent } = require('../models/card-event');
const { User } = require('../models/user');
const seedCards = require('../db/seed/cards');
const seedUsers = require('../db/seed/users');
const seedCardEvents = require('../db/seed/cardEvents');

const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
describe('Before and After Hooks', function() {
  let token;
  before(function() {
    return mongoose.connect(TEST_MONGODB_URI, { autoIndex: false });
  });

  beforeEach(function() {
    return Card.insertMany(seedCards)
      .then(() => Card.ensureIndexes())
      .then(() => CardEvent.insertMany(seedCardEvents))
      .then(() => CardEvent.ensureIndexes())
      .then(() => User.insertMany(seedUsers))
      .then(() => User.ensureIndexes())
      .then(() => User.findById('322222222222222222222200'))
      .then(response => {
        token = jwt.sign(
          {
            user: {
              email: response.email,
              id: response.id
            }
          },
          JWT_SECRET,
          {
            algorithm: 'HS256',
            subject: response.email,
            expiresIn: '7d'
          }
        );
      });
  });

  afterEach(function() {
    sandbox.restore();
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('Authorized access', function() {
    it('should respond with unauthorized with no token', function() {
      return chai
        .request(app)
        .get('/api/cards')
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
  });

  it('Should reject requests with an invalid token', function() {
    return User.findById('322222222222222222222200')
      .then(response => {
        return jwt.sign(
          {
            user: {
              email: response.email,
              id: response.id
            }
          },
          'wrong',
          {
            algorithm: 'HS256',
            subject: response.email,
            expiresIn: '7d'
          }
        );
      })
      .then(token => {
        return chai
          .request(app)
          .get('/api/cards')
          .set('Authorization', `Bearer ${token}`);
      })
      .then(() => expect.fail(null, null, 'Request should not succeed'))
      .catch(err => {
        if (err instanceof chai.AssertionError) {
          throw err;
        }
        const res = err.response;
        expect(res).to.have.status(401);
      });
  });

  describe('GET /cards', function() {
    it('should return a list of all notes on the database with no search term with a correct user', function() {
      let response;
      return chai
        .request(app)
        .get('/api/cards')
        .set('authorization', `Bearer ${token}`)
        .then(_response => {
          response = _response;
          expect(response).to.have.status(200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.eql(1);
          return Card.count({ userId: '322222222222222222222200' });
        })
        .then(count => {
          expect(count).to.equal(response.body.length);
        });
    });

    it('should return the correct values', function() {
      let item;
      return chai
        .request(app)
        .get('/api/cards')
        .set('authorization', `Bearer ${token}`)
        .then(_response => {
          item = _response.body[0];
          return Card.findById(item.id);
        })
        .then(response => {
          expect(item.id).to.equal(response.id);
          expect(item.title).to.equal(response.title);
        });
    });

    it('should catch errors and respond properly', function() {
      const spy = chai.spy();
      sandbox.stub(express.response, 'json').throws('TypeError');
      return chai
        .request(app)
        .get('/api/cards')
        .set('authorization', `Bearer ${token}`)
        .then(spy)
        .catch(err => {
          expect(err).to.have.status(500);
        })
        .then(() => {
          expect(spy).to.not.have.been.called();
        });
    });
  });

  describe('POST /notes', function() {
    it('should post a new card with proper attributes', function() {
      let newItem = {
        name: 'CATS'
      };

      return chai
        .request(app)
        .post('/api/cards')
        .set('authorization', `Bearer ${token}`)
        .send(newItem)
        .then(response => {
          expect(response).to.have.status(201);
          expect(response.body).to.be.an('object');
          expect(response.body.name).to.equal(newItem.name);
          return Card.count();
        })
        .then(response => {
          expect(response).to.equal(2);
        });
    });

    it('should 400 error when not all fields are present', function() {
      let newItem = { content: 'I am a cat' };
      let spy = chai.spy();
      return chai
        .request(app)
        .post('/api/cards')
        .set('authorization', `Bearer ${token}`)
        .send(newItem)
        .then(spy)
        .catch(err => {
          const res = err.response;
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Must include name');
        })
        .then(() => {
          expect(spy).to.not.have.been.called();
        });
    });

    it('should catch errors and respond properly', function() {
      const spy = chai.spy();
      let newItem = {
        name: 'CATS'
      };
      sandbox.stub(express.response, 'json').throws('TypeError');
      return chai
        .request(app)
        .post('/api/cards')
        .set('authorization', `Bearer ${token}`)
        .send(newItem)
        .then(spy)
        .catch(err => {
          expect(err).to.have.status(500);
        })
        .then(() => {
          expect(spy).to.not.have.been.called();
        });
    });
  });
});
