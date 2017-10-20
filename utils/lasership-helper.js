const moment = require('moment');
const request = require('request-promise');
const argv = require('yargs').alias('test', 't').alias('production', 'p').argv;

const apiId = process.env.LASERSHIP_API_ID;
const apiKey = process.env.LASERSHIP_API_KEY;
const testFlag = argv.t ? 1 : argv.p ? 0 : 1;

/**
 * Enum of key Lasership times (Critical Pull Time (CPT) and CPT +/- 1 hour).
 * All times are in UTC and relative to Brooklyn.
 * @param  {object} order The order object.
 * @return {object}       The Lasership time object.
 */
function lasershipTimes (order) {
  let lsTimeObject = [
    { label: 'expRFP', hrs: 20 },
    { label: 'cpt', hrs: 21 },
    { label: 'expDeparture', hrs: 22 }
  ];

  return lsTimeObject.reduce((obj, shipObj) => {
    let laserDate = new Date(order.ship_date);
    laserDate.setUTCHours(shipObj.hrs);
    obj[shipObj.label] = laserDate.toISOString().replace('.000Z', 'Z');
    return obj;
  }, {});
}

/**
 * Calculates the local delivery date and converts to UTC.
 * @param  {object} order    The order object.
 * @param  {string} datetime The UTC timestamp to convert.
 * @return {string}          The delivery date string.
 */
function localDeliveryDate (order, datetime) {
  return moment.utc(datetime.replace('Z', order.offset)).add(order.tnt, 'days').format();
}

/**
 * Constructor function for creating Lasership order JSON.
 * @param       {object} order The order object.
 * @constructor
 */
function LasershipOrder (order) {
  let lsTimes = lasershipTimes(order);

  this.CustomerBranch = "CFDBRKLN";
  this.CustomerOrderNumber = order.sales_order;
  this.OrderedFor = order.contact_name;
  this.OrderedBy = {
    Name: "Chef'd",
    Phone: "3105311935",
    Email: "tech@chefd.com"
  };
  this.Reference1 = `${order.reference}: ${order.sales_order}`;
  this.Reference2 = `SHIP DATE: ${order.ship_date}`;
  this.ServiceCode = "RD";
  this.PickupType = "LaserShip";
  this.Origin = {
    LocationType: "Business",
    CustomerClientID: "",
    Contact: "Purple Carrot",
    Organization: "Purple Carrot",
    Address: "365 Ten Eyck St.",
    Address2: "",
    PostalCode: "11206",
    City: "BROOKLYN",
    State: "NY",
    Country: "US",
    Phone: "8577038188",
    PhoneExtension: "",
    Email: "tech@chefd.com",
    Payor: "",
    Instruction: "",
    Note: "",
    UTCExpectedReadyForPickupBy: lsTimes.expRFP,
    UTCExpectedDeparture: lsTimes.expDeparture,
    CustomerRoute: "",
    CustomerSequence: ""
  };
  this.Destination = {
    LocationType: "Residence",
    CustomerClientID: "",
    Contact: order.contact_name,
    Organization: order.company_name,
    Address: order.address_1,
    Address2: order.address_2,
    PostalCode: order.postal_code,
    City: order.city,
    State: order.state,
    Country: order.country,
    Phone: order.telephone,
    PhoneExtension: "",
    Email: "",
    Payor: "",
    Instruction: order.special_delivery_instructions,
    Note: "",
    UTCExpectedDeliveryBy: localDeliveryDate(order, lsTimes.cpt),
    CustomerRoute: "",
    CustomerSequence: ""
  };
  this.Pieces = [{
    ContainerType: "CustomPackaging",
    CustomerBarcode: "",
    CustomerPalletBarcode: "",
    Weight: order.weight,
    WeightUnit: "lbs",
    Width: 13,
    Length: 13,
    Height: 13,
    DimensionUnit: "in",
    Description: "Meal Kit",
    Reference: "",
    DeclaredValue: 65,
    DeclaredValueCurrency: "USD",
    SignatureType: "NotRequired",
    Attributes: [{
      Type: "Perishable",
      Description: ""
    }]
  }];
}

/**
 * Submits an order to Lasership API.
 * @param  {object} order The Lasership JSON order object.
 * @return {Promise}      Resolves with response data from a successful response
 * or rejects with response data from an erroneous response.
 */
function submitOrder (order) {
  order = new LasershipOrder(order);
  let endpoint = `https://api.lasership.com/Method/PlaceOrder/json/${apiId}/${apiKey}/${testFlag}/1/DN4x6`;
  let encodedOrder = encodeURIComponent(JSON.stringify(order));

  return request.post(endpoint).form({Order: encodedOrder});
}

module.exports = {
  submitOrder
};
