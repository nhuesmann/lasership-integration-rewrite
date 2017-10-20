require('./config/config');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const { validateOrder } = require('./utils/order-validator');
const { getCsvNames, getCsvData, parseCsv, stringifyCsv, writeCsv, archiveCsv } = require('./utils/csv-helper');
const csvDirectory = `${__dirname}/csv/validate-addresses`;

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_API_KEY,
  Promise: Promise,
  rate: {
    limit: 50,
    period: 1000
  }
});

// TODO: add logging to everything!!

const csvs = getCsvNames(csvDirectory);
validateAddresses(csvs);

async function validateAddresses (csvNames) {
  for (let csvName of csvNames) {
    try {
      const buffer = await getCsvData(csvDirectory, csvName);
      let orders = parseCsv(buffer);

      orders = orders.map(order => validateOrder(order)).map(order => {
        let randInterval = Math.floor((Math.random() * 300) + 1);
        return setTimeoutPromise(randInterval, order).then((order) => validateAddressAndGetOffset(order));
      });

      orders = await Promise.all(orders);

      let validatedOrders = orders.filter(order => !order.error);
      let failedOrders = orders.filter(order => order.error);

      let log = `${csvName}: \n- ${validatedOrders.length} addresses validated successfully. \n- ${failedOrders.length} addresses failed validation.`;
      console.log(log);

      await createOrUpdateCsvs(csvName, validatedOrders, failedOrders);
      await archiveCsv(csvName, csvDirectory, `${csvDirectory}/archive`);

    } catch (e) {
      console.log(e);
    }
  }
}

/**
 * Validates address using Google Geocode API and gets the timezone offset and
 * Google formatted address string.
 * @param {object} order The order object.
 * @return {object}      The modified order object.
 */
async function validateAddressAndGetOffset (order) {
  if (order.error) return order;

  const address = order.address_2 ? `${order.address_1} ${order.address_2}` : order.address_1;

  try {
    let res = await googleMapsClient.geocode({
      address
    }).asPromise();

    if (res.json.status !== 'OK') {
      order.error = `Geocode: ${res.json.status}`;
      if (res.json.error_message) {
        order.error_detail = res.json.error_message;
      }
    } else {
      let address = res.json.results[0].address_components.reduce((prev, curr) => {
        if (curr.types.length > 1) {
          curr.types = curr.types.filter(type => type !== 'political');
        }
        prev[curr.types[0]] = curr.short_name;
        return prev;
      }, {});

      order.validated_address = res.json.results[0].formatted_address;
      order.geo_lat = res.json.results[0].geometry.location.lat;
      order.geo_lng = res.json.results[0].geometry.location.lng;
      order.address_1 = `${address.street_number} ${address.route}`;
      order.address_2 = address.subpremise || '';
      order.postal_code = address.postal_code;
      order.city = address.locality || address.sublocality;
      order.state = address.administrative_area_level_1;
      order.country = address.country;

      try {
        let res = await googleMapsClient.timezone({
          location: [order.geo_lat, order.geo_lng],
          timestamp: Math.floor(new Date() / 1000)
        }).asPromise();

        if (res.json.status !== 'OK') {
          order.error = `Timezone: ${res.json.status}`;
          if (res.json.error_message) {
            order.error_detail = res.json.error_message;
          }
        } else {
          let dstOffset = res.json.dstOffset;
          let rawOffset = res.json.rawOffset;
          let offset = (dstOffset + rawOffset)/3600;

          let negative;
          if (offset < 0) {
            negative = true;
            offset *= -1;
          }
          offset = offset < 10 ? `0${offset}:00` : `${offset}:00`;
          offset = negative ? `-${offset}` : offset;

          order.offset = offset;
          delete order.geo_lat;
          delete order.geo_lng;
        }
      } catch (e) {
        order.error = `Timezone: ${e}`;
      }
    }
  } catch (e) {
    order.error = `Geocode: ${e}`;
  }

  return order;
}

/**
 * Creates or updates CSVs for orders that passed and failed address validation, respectively.
 * @param  {string} csvName         The name of the CSV.
 * @param  {array} validatedOrders Array of orders that passed address validation.
 * @param  {array} failedOrders    Array of orders that failed address validation.
 */
async function createOrUpdateCsvs (csvName, validatedOrders, failedOrders) {
  const validatedDir = `${csvDirectory}/validated`;
  const validated = getCsvNames(validatedDir);

  if (validated.indexOf(csvName) > -1) {
    const buffer = await getCsvData(validatedDir, csvName);
    let priorValidOrders = parseCsv(buffer);
    validatedOrders = priorValidOrders.concat(validatedOrders);
  }

  if (validatedOrders.length > 0) {
    validatedOrders.sort((a, b) => a.sales_order - b.sales_order);
    let validatedCsvString = await stringifyCsv(validatedOrders);
    await writeCsv(`${csvDirectory}/validated`, `${csvName}`, validatedCsvString);
  }

  if (failedOrders.length > 0) {
    failedOrders.sort((a, b) => a.sales_order - b.sales_order);
    let failedCsvString = await stringifyCsv(failedOrders);
    await writeCsv(`${csvDirectory}/failed`, `${csvName}`, failedCsvString);
  }
}
