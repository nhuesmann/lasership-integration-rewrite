require('../config/config');
const { expect } = require('chai');
const path = require('path');

const seed = require(path.join(__dirname, '../test/seed.js'));
const lasershipHelper = require('./lasership-helper.js');

describe('The lasership helper module', function () {
  it('submitOrder() should submit an order to LaserShip API and return the response', async function () {
    let order = await lasershipHelper.submitOrder(seed.validOrder);
    expect(order).to.be.a('string');

    order = JSON.parse(order);
    expect(order).to.be.an('object');
    expect(order.Error).to.be.false;
    expect(order.Order).to.include({
      CustomerOrderNumber: '123456',
      OrderedFor: 'Nathan Huesmann',
    });
  });
});
