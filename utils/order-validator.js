const propsToValidate = [
  'contact_name',
  'address_1',
  'postal_code',
  'city',
  'state',
  'country',
  'ship_date',
  'weight',
  'reference',
  'tnt',
];

const validate = {
  telephone: function (phone) {
    return phone.length < 10
      ? '1111111111'
      : phone.replace(/\W/g, ' ').replace(/\s+/g, '');
  },

  postal_code: function (zip) {
    return zip.length === 4
      ? `0${zip}`
      : zip;
  },

  tnt: function (tnt) {
    return +tnt;
  },
};

/**
 * Checks that all required properties are present and perfoms additional data
 * cleansing on a subset of those properties.
 * @param  {object} order The order object.
 * @return {object}       The validated and cleansed order object.
 */
function validateOrder(order) {
  delete order.error;
  delete order.error_detail;

  let orderErrors;
  propsToValidate.forEach(prop => {
    let error;
    if (!order[prop]) {
      error = true;
    }

    if (!error) {
      if (validate[prop]) order[prop] = validate[prop](order[prop]);
    } else {
      orderErrors = orderErrors instanceof Array
        ? orderErrors
        : [];
      orderErrors.push(` Missing ${prop}`);
    }
  });

  order.telephone = validate.telephone(order.telephone);

  // Specific validation for address_2 field
  let validAddrTwoFields = ['ste', 'suite', 'apt', 'apartment', '#', 'unit'];

  if (order.address_2.length > 0 && (order.address_2.length >= 15
    || !validAddrTwoFields.some(field => order.address_2.toLowerCase().startsWith(field)))) {

    if (order.special_delivery_instructions) {
      order.special_delivery_instructions = `${order.address_2} - ${order.special_delivery_instructions}`;
    } else {
      order.special_delivery_instructions = order.address_2;
    }

    order.address_2 = '';
  }

  if (orderErrors) {
    order.error = `Sales Order ${order.sales_order}: ${orderErrors}`;
  }

  return order;
}

module.exports = {
  validateOrder,
};
