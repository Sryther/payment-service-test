'use strict';

var dotenv = require('dotenv');
dotenv.load();

module.exports = {
  api: {
    port: process.env.PORT || 3000
  },
  mongodb: {
    address: process.env.DB_DOMAIN || 'localhost',
    port: process.env.DB_PORT || '27017',
    database: 'bank'
  }
};
