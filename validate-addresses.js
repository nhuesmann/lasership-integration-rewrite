require('./config/config');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const { validateOrder } = require('./utils/order-validator');
const { getCsvNames, getCsvData, parseCsv, stringifyCsv, writeCsv, archiveCsv } = require('./utils/csv-helper');
const { log } = require('./utils/log');

const caller = 'validate-addresses';
const csvDirectory = `${__dirname}/csv/validate-addresses`;

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_API_KEY,
  Promise: Promise,
  rate: {
    limit: 50,
    period: 1000,
  },
});

const csvs = getCsvNames(csvDirectory);
validateAddresses(csvs);

async function validateAddresses(csvNames) {
  for (let csvName of csvNames) {
    try {
      const buffer = await getCsvData(csvDirectory, csvName);
      let orders = parseCsv(buffer);

      // Run all orders through the order validator before sending to google API
      orders = orders.map(order => validateOrder(order)).map(order => {
        let randInterval = Math.floor((Math.random() * 300) + 1);
        return setTimeoutPromise(randInterval, order)
          .then((order) => validateAddressAndGetOffset(order));
      });

      // Await all responses and separate validated from failed orders
      orders = await Promise.all(orders);
      let validatedOrders = orders.filter(order => !order.error);
      let failedOrders = orders.filter(order => order.error);

      let message = `${csvName} \n- ${validatedOrders.length} addresses validated successfully. \n- ${failedOrders.length} addresses failed validation.`;
      log(caller, message);

      // Create or update validated and failed csvs, then archive the original csv
      await createOrUpdateCsvs(csvName, validatedOrders, failedOrders);
      await archiveCsv(csvName, csvDirectory, `${csvDirectory}/archive`);

      message = `${csvName} finished validation.`;
      log(caller, message);

    } catch (e) {
      log(caller, e);
    }
  }
}

/**
 * Validates address using Google Geocode API and gets the timezone offset and
 * Google formatted address string.
 * @param {object} order      The order object.
 * @param {string} [retryZip] The zip code string of an address that is retrying Google API call
 * @return {object}           The modified order object.
 */
async function validateAddressAndGetOffset(order, retryZip) {
  if (order.error) return order;

  // Create a string representing the full address or the zip code if retrying the API call
  let address = retryZip
    ? retryZip
    : `${order.address_1}, ${order.city}, ${order.state} ${order.postal_code}`;

  // Call Google geocode API to get the latitude and longitude
  try {
    let res = await googleMapsClient.geocode(
      {
        address,
      }
    ).asPromise();

    /**
     * If API error, add to order and skip processing. If address not found,
     * retry Geocode API call using only the zip code.
     */
    if (res.json.status !== 'OK') {
      if (res.json.status === 'ZERO_RESULTS') {
        return validateAddressAndGetOffset(order, order.postal_code);
      }
      order.error = `Geocode: ${res.json.status}`;

    } else {
      // If no errors, continue process. First, find the zip from the response
      let foundZip = res.json.results[0].address_components
        .find(component => component.types[0] === 'postal_code').long_name;

      // Verify the zip found by Google matches the order's zip
      let correctAddressFound = order.postal_code === foundZip;

      /**
       * If the zip from the response does not match the order zip,
       * retry Geocode API call using only the zip code.
       */
      if (foundZip && !correctAddressFound) {
        return validateAddressAndGetOffset(order, order.postal_code);
      }

      // Save the latitude and longitude
      let geoLat = res.json.results[0].geometry.location.lat;
      let geoLng = res.json.results[0].geometry.location.lng;

      // Call the Google timezone API to get the UTC offset
      try {
        let res = await googleMapsClient.timezone(
          {
            location: [geoLat, geoLng],
            timestamp: Math.floor(new Date() / 1000),
          }
        ).asPromise();

        // If response status is anything other than 'OK', set the error and skip execution
        if (res.json.status !== 'OK') {
          order.error = `Timezone: ${res.json.status}`;
          if (res.json.error_message) {
            order.error_detail = res.json.error_message;
          }
        } else {

          // Calculate the offset, converting from ms to hours
          let dstOffset = res.json.dstOffset;
          let rawOffset = res.json.rawOffset;
          let offset = (dstOffset + rawOffset) / 3600;

          let negative;
          if (offset < 0) {
            negative = true;
            offset *= -1;
          }

          // Build the offset string
          offset = offset < 10 ? `0${offset}:00` : `${offset}:00`;
          offset = negative ? `-${offset}` : offset;

          order.offset = offset;
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
async function createOrUpdateCsvs(csvName, validatedOrders, failedOrders) {
  const validatedDir = `${csvDirectory}/validated`;
  const validated = getCsvNames(validatedDir);

  try {
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
  } catch (e) {
    log(caller, e);
  }
}
