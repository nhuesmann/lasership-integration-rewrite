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
  // Remove any pre-existing errors (from previous execution)
  delete order.error;
  delete order.error_detail;

  // Validate each required property
  let orderErrors;
  propsToValidate.forEach(prop => {
    let error;
    if (!order[prop]) {
      error = true;
    }

    // Perform additional validation for the few fields that need it
    if (!error) {
      if (validate[prop]) order[prop] = validate[prop](order[prop]);
    } else {
      orderErrors = orderErrors instanceof Array
        ? orderErrors
        : [];
      orderErrors.push(` Missing ${prop}`);
    }
  });

  // Perform specific validation for telephone
  order.telephone = validate.telephone(order.telephone);

  // Regex for removing whitespace
  let trimWhiteSpace = /^[ \t]+|[ \t]+$/g;

  // Remove commas and periods
  order.address_1 = order.address_1.replace(/[,.]/g, '');

  // Check if address_1 contains address_2 components
  let addrTwoComponentsToRemove = /\s((apartment|apt|suite|ste|unit)\s|#).*/gi;
  let textToRemove = order.address_1.match(addrTwoComponentsToRemove);

  // If address_1 contains address_2 components, remove and reassign
  if (textToRemove) {
    order.address_1 = order.address_1.replace(textToRemove, '');
    order.address_2 = order.address_2
      ? order.address_2
      : textToRemove[0].replace(trimWhiteSpace, '');
  }

  // Remove commas, periods, and the hash symbol
  order.address_2 = order.address_2.replace(/[,.#]/g, '');

  // Valid strings for address_2
  let validAddrTwoComponents = /^(((apartment|apt|suite|ste|unit)\s\w{1,5})|\d+\w{0,4})/gi;

  // Find if address_2 is valid
  let validAddressTwo = order.address_2.match(validAddrTwoComponents);

  // Create placeholder vars
  let specialDeliveryText = '', addressTwoString = '';

  if (validAddressTwo) {
    // Get the valid address string
    addressTwoString = validAddressTwo[0];
    // Check if there is anything after the valid string
    let extraText = order.address_2.split(addressTwoString)[1];

    if (extraText) {
      // Get the extra content
      specialDeliveryText = extraText.replace(trimWhiteSpace, '');
    }
  } else {
    // If address_2 is invalid, set it up to be the order.special_delivery_instructions instead
    specialDeliveryText = order.address_2;
  }

  // Check if there are special delivery instructions
  if (order.special_delivery_instructions) {
    // Prepend if there is specialDeliveryText and it is not the same as existing instructions
    if (specialDeliveryText && specialDeliveryText !== order.special_delivery_instructions) {
      order.special_delivery_instructions = `${specialDeliveryText} - ${order.special_delivery_instructions}`;
    }
  } else {
    // Otherwise replace the text
    order.special_delivery_instructions = specialDeliveryText;
  }

  // Replace address_2 with the correct string
  order.address_2 = addressTwoString;

  // Add any validation errors to the order
  if (orderErrors) {
    order.error = `Sales Order ${order.sales_order}: ${orderErrors}`;
  }

  return order;
}

module.exports = {
  validateOrder,
};
