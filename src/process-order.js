'use strict';

var amountVerify = require('./../lib/amount-verify');

var Promise = require('bluebird');
var Validator = require('jsonschema').Validator;
var v = new Validator();
var _ = require('lodash');

var schema = {
  type: 'object',
  properties: {
    numbers: {
      type: 'string',
      pattern: '^[0-9]{16}$'
    },
    cvv: {
      type: 'string',
      pattern: '^[0-9]{3}$'
    },
    date: {
      type: 'object',
      properties: {
        month: {
          type: 'string',
          pattern: '^(0?[1-9]|1[012])$'
        },
        year: {
          type: 'string',
          pattern: '^[0-9]{2}$'
        }
      },
      required: [
        'month',
        'year'
      ]
    },
    amount: {
      type: 'number'
    }
  },
  required: [
    'numbers',
    'cvv',
    'date',
    'amount'
  ]
};

module.exports = function processOrder(database) {
  return function (req, res) {
    return _schemaVerification(req.body)
      .then(_processOrder)
      .then(_handleResponse)
      .catch(_handleError);

    /**
     * Verifies the request schema.
     * @param {Object} body - The request body.
     * @returns {Promise.<Object>} a promise that resolves the request body.
     * @private
     */
    function _schemaVerification(body) {
      var validation = v.validate(body, schema);
      if (_.has(validation, 'errors') && validation.errors.length < 1) {
        return Promise.resolve(body);
      }

      var errors = _.map(validation.errors, function (error) {
        return error.stack;
      });

      return Promise.reject({
        status: 400,
        message: errors
      });
    }

    /**
     * Processes an order.
     * @param {Object} body - The request body.
     * @returns {Promise.<Object>} a promise that resolves a response.
     * @private
     */
    function _processOrder(body) {
      var card = {
        numbers: body.numbers,
        cvv: body.cvv,
        date: {
          month: body.date.month,
          year: body.date.year
        }
      };

      var amount = body.amount;

      return _getCredit()
        .then(function (user) {
          if (amountVerify(amount, user.credit)) {
            return Promise.resolve({
              status: 200,
              message: 'Payment refused, the amount is too high'
            });
          }

          return _removeCredit(user)
            .then(function () {
              return Promise.resolve({
                status: 200,
                message: 'Payment accepted'
              });
            });
        })
        .catch(_handleMongoError);

      /**
       * Gets the user's credit amount.
       * @returns {Promise.<Object>} a promise that resolves the user.
       * @private
       */
      function _getCredit() {
        var projection = {
          credit: 1
        };

        var query = {
          card: card
        };

        return database.collection('users').findOneAsync(query, projection)
          .then(function (result) {
            if (!result) {
              return Promise.reject({
                code: 'CARD-NOT-FOUND',
                message: 'No matching card'
              });
            }

            return Promise.resolve(result);
          });
      }

      /**
       * Removes credit for a user.
       * @param {Object} user - The user.
       * @returns {Promise.<undefined>} a promise that resolves nothing.
       * @private
       */
      function _removeCredit(user) {
        var query = {
          card: card
        };

        var update = {
          $set: {
            credit: user.credit - amount
          }
        };

        return database.collection('users').updateAsync(query, update)
          .return();
      }

      /**
       * Handles a Mongo error.
       * @param {Object} error - The mongo error.
       * @returns {Promise.<Object>} a promise that rejects an error.
       * @private
       */
      function _handleMongoError(error) {
        if (_.has(error, 'code') && error.code === 'CARD-NOT-FOUND') {
          return Promise.reject({
            status: 404,
            message: error.message
          });
        }

        return Promise.reject({
          status: 500,
          message: error
        });
      }
    }

    /**
     * Handles the final response.
     * @param {Object} response - The response.
     * @private
     */
    function _handleResponse(response) {
      res.status(response.status).send(response.message);
    }

    /**
     * Handles an error.
     * @param {Object} error - The error.
     * @private
     */
    function _handleError(error) {
      res.status(error.status).send(error.message);
    }
  };
};
