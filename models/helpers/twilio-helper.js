'use strict';
require('dotenv').config();
const twilio = require('twilio');
const { CardNotification } = require('../card-notification');
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const client = new twilio(accountSid, authToken);

/**
 * SendNotifications does a mongo query to see what notifcations need to be sent
 * by checking if the notification needs to be sent based on time and if it hasn't
 * already been sent. Once it finds all of those notifications it will check to see
 * if the event has been completed and then if all of those conditions are correct
 * it will create the SMS and forward it to the Twilio API. Once the messages have
 * successfully sent then the status of the CardNotification gets set to 'SENT'.
 */
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
    .then(() => {
      return CardNotification.updateMany(
        { sendTime: { $lt: Date.now() }, status: 'NOT_SENT' },
        { status: 'SENT' }
      );
    })
    .catch(err => console.error(err));
}
module.exports = sendNotifications;
