'use strict';

var config = require('./config');

var Promise = require('bluebird');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
Promise.promisifyAll(mongodb);

var url = 'mongodb://' + config.mongodb.address + ':' + config.mongodb.port + '/' + config.mongodb.database;
console.log('url', JSON.stringify(url, null, 2));
MongoClient.connectAsync(url)
  .then(function (database) {
    var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');

    app.use(bodyParser.json());

    app.post('/order/process', require('./src/process-order')(database));

    app.listen(config.api.port, function () {
      console.log('Example app listening on port ' + config.api.port + '!');
    });
  })
  .catch(function (error) {
    console.log(error);
  });
