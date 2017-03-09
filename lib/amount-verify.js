'use strict';

module.exports = function amountVerify(amount, available) {
  return amount * 5 >= available;
};
