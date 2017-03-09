'use strict';

var chai = require('chai');
chai.use(require('chai-as-promised'));
var config = require('../config.test');
var expect = chai.expect;
var _ = require('lodash');
var Promise = require('bluebird');
var request = require('request-promise');
var dotenv = require('dotenv');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

dotenv.load();
Promise.promisifyAll(mongodb);

var DATA_USERS = _.cloneDeep(require('../data/users.json'));
var mongoConfig = config.mongodb;
var DATABASE = 'mongodb://' + mongoConfig.address + ':' + mongoConfig.port + '/' + mongoConfig.database;

var API_PREFIX = 'http://localhost:3000';

var ROUTES = {
  PROCESS_ORDER: '/order/process'
};

describe('Process order', function () {
  var database = null;
  var collections = {
    users: null
  };

  before(function () {
    return MongoClient.connectAsync(DATABASE)
      .then(function (db) {
        database = db;
        collections.users = db.collection('users');
      })
      .then(function () {
        require('../../index');
        return Promise.delay(500);
      });
  });

  beforeEach(function () {
    return collections.users.insertAsync(DATA_USERS);
  });

  afterEach(function () {
    return collections.users.removeAsync({});
  });

  describe('Schema validation (TDD)', function () {

    describe('Card numbers', function () {
      it('should return a 400 error because the card number is too short', function () {
        var options = {
          uri: API_PREFIX + ROUTES.PROCESS_ORDER,
          method: 'POST',
          body: {
            numbers: '1234',
            cvv: '123',
            date: {
              month: '01',
              year: '01'
            },
            amount: 20
          },
          json: true
        };

        return expect(request(options)).to.be.rejected
          .then(function (err) {
            expect(err).to.be.an('Object');
            expect(err).to.have.property('statusCode', 400);
            expect(err).to.have.property('error').to.be.deep.equal([
              'instance.numbers does not match pattern \"^[0-9]{16}$\"'
            ]);
          });
      });

      it('should return a 400 error because the card number is missing', function () {
        var options = {
          uri: API_PREFIX + ROUTES.PROCESS_ORDER,
          method: 'POST',
          body: {
            cvv: '123',
            date: {
              month: '01',
              year: '01'
            },
            amount: 20
          },
          json: true
        };

        return expect(request(options)).to.be.rejected
          .then(function (err) {
            expect(err).to.be.an('Object');
            expect(err).to.have.property('statusCode', 400);
            expect(err).to.have.property('error').to.be.deep.equal([
              'instance requires property \"numbers\"'
            ]);
          });
      });

      it('should return a 400 error because the card number doesn\'t contain only numbers', function () {
        var options = {
          uri: API_PREFIX + ROUTES.PROCESS_ORDER,
          method: 'POST',
          body: {
            numbers: '12341a341c341d34',
            cvv: '123',
            date: {
              month: '01',
              year: '01'
            },
            amount: 20
          },
          json: true
        };

        return expect(request(options)).to.be.rejected
          .then(function (err) {
            expect(err).to.be.an('Object');
            expect(err).to.have.property('statusCode', 400);
            expect(err).to.have.property('error').to.be.deep.equal([
              'instance.numbers does not match pattern \"^[0-9]{16}$\"'
            ]);
          });
      });
    });

    describe('Card CVV', function () {
      it('should return a 400 error because the card CVV is too short', function () {
        var options = {
          uri: API_PREFIX + ROUTES.PROCESS_ORDER,
          method: 'POST',
          body: {
            numbers: '1234123412341234',
            cvv: '12',
            date: {
              month: '01',
              year: '01'
            },
            amount: 20
          },
          json: true
        };

        return expect(request(options)).to.be.rejected
          .then(function (err) {
            expect(err).to.be.an('Object');
            expect(err).to.have.property('statusCode', 400);
            expect(err).to.have.property('error').to.be.deep.equal([
              'instance.cvv does not match pattern \"^[0-9]{3}$\"'
            ]);
          });
      });

      it('should return a 400 error because the card CVV is missing', function () {
        var options = {
          uri: API_PREFIX + ROUTES.PROCESS_ORDER,
          method: 'POST',
          body: {
            numbers: '1234123412341234',
            date: {
              month: '01',
              year: '01'
            },
            amount: 20
          },
          json: true
        };

        return expect(request(options)).to.be.rejected
          .then(function (err) {
            expect(err).to.be.an('Object');
            expect(err).to.have.property('statusCode', 400);
            expect(err).to.have.property('error').to.be.deep.equal([
              'instance requires property \"cvv\"'
            ]);
          });
      });

      it('should return a 400 error because the card CVV doesn\'t contain only numbers', function () {
        var options = {
          uri: API_PREFIX + ROUTES.PROCESS_ORDER,
          method: 'POST',
          body: {
            numbers: '1234123412341234',
            cvv: '12a',
            date: {
              month: '01',
              year: '01'
            },
            amount: 20
          },
          json: true
        };

        return expect(request(options)).to.be.rejected
          .then(function (err) {
            expect(err).to.be.an('Object');
            expect(err).to.have.property('statusCode', 400);
            expect(err).to.have.property('error').to.be.deep.equal([
              'instance.cvv does not match pattern \"^[0-9]{3}$\"'
            ]);
          });
      });
    });

    describe('Card date', function () {
      it('should return a 400 error because the card date month is too short', function () {
        var options = {
          uri: API_PREFIX + ROUTES.PROCESS_ORDER,
          method: 'POST',
          body: {
            numbers: '1234123412341234',
            cvv: '123',
            date: {
              month: '',
              year: '01'
            },
            amount: 20
          },
          json: true
        };

        return expect(request(options)).to.be.rejected
          .then(function (err) {
            expect(err).to.be.an('Object');
            expect(err).to.have.property('statusCode', 400);
            expect(err).to.have.property('error').to.be.deep.equal([
              'instance.date.month does not match pattern \"^(0?[1-9]|1[012])$\"'
            ]);
          });
      });

      it('should return a 400 error because the card date year is too short', function () {
        var options = {
          uri: API_PREFIX + ROUTES.PROCESS_ORDER,
          method: 'POST',
          body: {
            numbers: '1234123412341234',
            cvv: '123',
            date: {
              month: '01',
              year: ''
            },
            amount: 20
          },
          json: true
        };

        return expect(request(options)).to.be.rejected
          .then(function (err) {
            expect(err).to.be.an('Object');
            expect(err).to.have.property('statusCode', 400);
            expect(err).to.have.property('error').to.be.deep.equal([
              'instance.date.year does not match pattern \"^[0-9]{2}$\"'
            ]);
          });
      });

      it('should return a 400 error because the card date is missing', function () {
        var options = {
          uri: API_PREFIX + ROUTES.PROCESS_ORDER,
          method: 'POST',
          body: {
            numbers: '1234123412341234',
            cvv: '123',
            amount: 20
          },
          json: true
        };

        return expect(request(options)).to.be.rejected
          .then(function (err) {
            expect(err).to.be.an('Object');
            expect(err).to.have.property('statusCode', 400);
            expect(err).to.have.property('error').to.be.deep.equal([
              'instance requires property \"date\"'
            ]);
          });
      });

      it('should return a 400 error because the card date month cannot be above 12', function () {
        var options = {
          uri: API_PREFIX + ROUTES.PROCESS_ORDER,
          method: 'POST',
          body: {
            numbers: '1234123412341234',
            cvv: '123',
            date: {
              month: '13',
              year: '01'
            },
            amount: 20
          },
          json: true
        };

        return expect(request(options)).to.be.rejected
          .then(function (err) {
            expect(err).to.be.an('Object');
            expect(err).to.have.property('statusCode', 400);
            expect(err).to.have.property('error').to.be.deep.equal([
              'instance.date.month does not match pattern \"^(0?[1-9]|1[012])$\"'
            ]);
          });
      });
    });

    describe('Amount', function () {
      it('should return a 400 error because the amount isn\'t a number', function () {
        var options = {
          uri: API_PREFIX + ROUTES.PROCESS_ORDER,
          method: 'POST',
          body: {
            numbers: '1234123412341234',
            cvv: '123',
            date: {
              month: '01',
              year: '01'
            },
            amount: ''
          },
          json: true
        };

        return expect(request(options)).to.be.rejected
          .then(function (err) {
            expect(err).to.be.an('Object');
            expect(err).to.have.property('statusCode', 400);
            expect(err).to.have.property('error').to.be.deep.equal([
              'instance.amount is not of a type(s) number'
            ]);
          });
      });

      it('should return a 400 error because the amount is missing', function () {
        var options = {
          uri: API_PREFIX + ROUTES.PROCESS_ORDER,
          method: 'POST',
          body: {
            numbers: '1234123412341234',
            cvv: '123',
            date: {
              month: '01',
              year: '01'
            }
          },
          json: true
        };

        return expect(request(options)).to.be.rejected
          .then(function (err) {
            expect(err).to.be.an('Object');
            expect(err).to.have.property('statusCode', 400);
            expect(err).to.have.property('error').to.be.deep.equal([
              'instance requires property \"amount\"'
            ]);
          });
      });
    });
  });

  describe('Service validation (TDD)', function () {
    it('should return a 404 error because the user with this card is unknown', function () {
      var options = {
        uri: API_PREFIX + ROUTES.PROCESS_ORDER,
        body: {
          numbers: '1234123412341234',
          cvv: '444',
          date: {
            month: '01',
            year: '01'
          },
          amount: 30
        },
        method: 'POST',
        json: true
      };

      return expect(request(options)).to.be.rejected
        .then(function (err) {
          expect(err).to.be.an('Object');
          expect(err).to.have.property('statusCode', 404);
          expect(err).to.have.property('message', '404 - "No matching card"');
        });
    });

    it('should return a 200 with a payment error because the amount is too high', function () {
      var options = {
        uri: API_PREFIX + ROUTES.PROCESS_ORDER,
        body: {
          numbers: '1234123412341234',
          cvv: '123',
          date: {
            month: '01',
            year: '01'
          },
          amount: 3000
        },
        method: 'POST',
        json: true
      };

      return expect(request(options)).to.be.fulfilled
        .then(function (result) {
          expect(result).to.be.equal('Payment refused, the amount is too high');
        });
    });

    it('should return a 200 with a payment accepted', function () {
      var options = {
        uri: API_PREFIX + ROUTES.PROCESS_ORDER,
        body: {
          numbers: '1234123412341234',
          cvv: '123',
          date: {
            month: '01',
            year: '01'
          },
          amount: 30
        },
        method: 'POST',
        json: true
      };

      return expect(request(options)).to.be.fulfilled
        .then(function (result) {
          expect(result).to.be.equal('Payment accepted');
        });
    });
  });

  describe('Behaviour validation (BDD)', function () {
    it('should decrease the credit amount of a user after a purchase', function () {
      var options = {
        uri: API_PREFIX + ROUTES.PROCESS_ORDER,
        body: {
          numbers: '1234123412341234',
          cvv: '123',
          date: {
            month: '01',
            year: '01'
          },
          amount: 30
        },
        method: 'POST',
        json: true
      };

      return expect(request(options)).to.be.fulfilled
        .then(function (result) {
          expect(result).to.be.equal('Payment accepted');
        })
        .then(function () {
          return collections.users.findOneAsync({
            card: {
              numbers: '1234123412341234',
              cvv: '123',
              date: {
                month: '01',
                year: '01'
              }
            }
          });
        })
        .then(function (user) {
          expect(user).to.have.property('credit', 270);
        });
    });

    it('should not decrease the credit amount of a user after a purchase because the payment is refused', function () {
      var options = {
        uri: API_PREFIX + ROUTES.PROCESS_ORDER,
        body: {
          numbers: '1234123412341234',
          cvv: '123',
          date: {
            month: '01',
            year: '01'
          },
          amount: 300
        },
        method: 'POST',
        json: true
      };

      return expect(request(options)).to.be.fulfilled
        .then(function (result) {
          expect(result).to.be.equal('Payment refused, the amount is too high');
        })
        .then(function () {
          return collections.users.findOneAsync({
            card: {
              numbers: '1234123412341234',
              cvv: '123',
              date: {
                month: '01',
                year: '01'
              }
            }
          });
        })
        .then(function (user) {
          expect(user).to.have.property('credit', 300);
        });
    });
  });
});
