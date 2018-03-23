'use strict';
const { CardEvent } = require('../card-event');

/**
 * checkExpiration functions in the same way that sendNotifications does.
 * It does a database query to check if there is any expired Events and if
 * there are it sets the Status to 'MISSED'
 */
function checkExpiration() {
  CardEvent.updateMany(
    { expires: { $lt: Date.now() }, status: 'NOT_CHECKED' },
    { status: 'MISSED' }
  ).then(() => {
    return;
  });
}

module.exports = checkExpiration;
