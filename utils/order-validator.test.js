const { expect } = require('chai');
const path = require('path');

const seed = require(path.join(__dirname, '../test/seed.js'));
const { validateOrder } = require('./order-validator.js');

describe('The order validator', function () {
  it('should approve orders in which all required properties are present', function () {
    let validated = validateOrder(seed.validOrder);

    expect(validated).to.not.have.property('error');
  });

  it('should reject orders missing any required properties', function () {
    let validated = validateOrder(seed.invalidOrder);

    expect(validated).to.have.property('error');
  });

  it('should perform further validation on specified properties', function () {
    let validated = validateOrder(seed.orderToCleanse);

    expect(validated).to.be.an('object').that.includes({
      address_2: '',
      telephone: '3105311935',
      postal_code: '01234',
      tnt: 2,
    });
  });
});
