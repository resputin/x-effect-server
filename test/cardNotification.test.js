'use strict';
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
const { CardNotification } = require('../models/card-notification');
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

  describe('POST /notifications', function() {
    it('should post new notifications with proper attributes', function() {
      let newItem = {
        minutesUntilExpires: 720,
        sendTo: '6197278112',
        cardId: '000000000000000000000000',
        message: 'Hello!'
      };

      return chai
        .request(app)
        .post('/api/notifications')
        .set('authorization', `Bearer ${token}`)
        .send(newItem)
        .then(response => {
          expect(response).to.have.status(201);
          expect(response.body).to.be.an('array');
          return CardNotification.count();
        })
        .then(response => {
          expect(response).to.equal(49);
        });
    });
  });
});
