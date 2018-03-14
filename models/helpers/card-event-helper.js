'use strict';

const express = require('express');
const { CardEvent } = require('../card-event');

function checkExpiration() {
  CardEvent.updateMany({ expires: { $lt: Date.now() }, status: 'NOT_CHECKED' }, {status: 'MISSED'}).then(
    response => {
      console.log(response);
    }
  );
}
// checkExpiration();
module.exports = checkExpiration;
