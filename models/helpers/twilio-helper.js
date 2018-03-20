'use strict';
require('dotenv').config();
const twilio = require('twilio');
const { CardNotification } = require('../card-notification');

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;

const client = new twilio(accountSid, authToken);

function sendNotifications() {
  CardNotification.find({ sendTime: { $lt: Date.now() }, status: 'NOT_SENT' })
    .populate('cardEventId')
    .then(response => {
      if (response) {
        const notificationsPending = [];
        response.forEach(notification => {
          if (notification.cardEventId.status === 'NOT_CHECKED')
            notificationsPending.push(
              client.messages.create({
                body: notification.body,
                to: `+1${notification.sendTo}`,
                from: '+17606426357'
              })
            );
        });
        return Promise.all(notificationsPending);
      }
    })
    .then(response => {
      return CardNotification.updateMany(
        { sendTime: { $lt: Date.now() }, status: 'NOT_SENT' },
        { status: 'SENT' }
      );
    })
    .then(response => console.log('SENT', response))
    .catch(err => console.log(err));
}
module.exports = sendNotifications;

// client.messages
//   .create({
//     body: 'Hello from Node',
//     to: '+16197278112', // Text this number
//     from: '+17606426357' // From a valid Twilio number
//   })
//   .then(message => console.log(message.sid));
