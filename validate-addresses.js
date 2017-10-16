require('./config/config');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const { getCsvNames, getCsvData, parseCsv, stringifyCsv, writeCsv, archiveCsvs } = require('./utils/csv-helper');
const csvDirectory = `${__dirname}/csv/validate-addresses`;

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_API_KEY,
  Promise: Promise,
  rate: {
    limit: 45,
    period: 1000
  }
});

const csvs = getCsvNames(csvDirectory);
csvs.forEach(csv => main(csv));


///// RUN EACH CSV THROUGH THIS function

// function to run csvs through google address validation
// need to add limit of 50/second (batches of 50)

async function main (csvName) {
  try {
    const buffer = await getCsvData(csvDirectory, csvName);
    let orders = parseCsv(buffer);

    // orders = orders.slice(75, 575);
    // because each CSV will be running async, need to do the following:
      // count how many csvs are being processed
      // break the chunks into 50/number of csvs processed
      // meaning, if there are 8 csvs simulataneously going, it will be rate limited to 6 per second in the main function
    // MIGHT NOT NEED TO BC OF ONE CLIENT FOR EVERYTHING, built in rate limiting



    orders = orders.map(order => {
      let randInterval = Math.floor((Math.random() * 2000) + 1);
      return setTimeoutPromise(randInterval, validateAddressPromise(order));
    });
    orders = await Promise.all(orders);

    let successfulOrders = orders.filter(order => !order.ERROR);
    let failedOrders = orders.filter(order => order.ERROR);

    console.log(csvName);
    console.log(`${successfulOrders.length} successful orders`, successfulOrders[0]);
    console.log(`${failedOrders.length} failed orders`, failedOrders[0]);

    // FOR SUCCESSFUL RESPONSES:
      // get the geoLat and geoLng and save to the order object for a new column in CSV (needed for timezone!)
      // add to group of succesful queries
    // FOR FAILING RESPONSES:
      // add the failure code as ERROR property to order object
      // add to group of failed queries
    // save the CSV
  } catch (e) {
    console.log(e);
  }
}

/*
function validateAddress (order) {
  return new Promise((resolve, reject) => {
    const address = order.ADDRESS_2 ? `${order.ADDRESS_1} ${order.ADDRESS_2}` : order.ADDRESS_1;
    googleMapsClient.geocode({
      address
    }, (err, response) => {
      if (err) {
        order.ERROR = err;
      } else if (response.json.status !== 'OK') {
        order.ERROR = response.json.status;
        order.ERROR_DETAIL = response.json.error_message || '';
      } else {
        let address = response.json.results[0].address_components.reduce((prev, curr) => {
          if (curr.types.length > 1) {
            curr.types = curr.types.filter(type => type !== 'political');
          }
          prev[curr.types[0]] = curr.short_name;
          return prev;
        }, {});

        order.VALDATED_ADDRESS = response.json.results[0].formatted_address;
        order.GEO_LAT = response.json.results[0].geometry.location.lat;
        order.GEO_LNG = response.json.results[0].geometry.location.lng;
        order.ADDRESS_1 = `${address.street_number} ${address.route}`;
        order.ADDRESS_2 = address.subpremise || '';
        order.POSTAL_CODE = address.postal_code;
        order.CITY = address.locality || address.sublocality;
        order.STATE = address.administrative_area_level_1;
        order.COUNTRY = address.country;
      }

      resolve(order);
    });
  });
}
*/

async function validateAddressPromise (order) {
  const address = order.ADDRESS_2 ? `${order.ADDRESS_1} ${order.ADDRESS_2}` : order.ADDRESS_1;

  try {
    let res = await googleMapsClient.geocode({
      address
    }).asPromise();

    if (res.json.status !== 'OK') {
      order.ERROR = res.json.status;
      order.ERROR_DETAIL = res.json.error_message || '';
    } else {
      let address = res.json.results[0].address_components.reduce((prev, curr) => {
        if (curr.types.length > 1) {
          curr.types = curr.types.filter(type => type !== 'political');
        }
        prev[curr.types[0]] = curr.short_name;
        return prev;
      }, {});

      order.VALDATED_ADDRESS = res.json.results[0].formatted_address;
      order.GEO_LAT = res.json.results[0].geometry.location.lat;
      order.GEO_LNG = res.json.results[0].geometry.location.lng;
      order.ADDRESS_1 = `${address.street_number} ${address.route}`;
      order.ADDRESS_2 = address.subpremise || '';
      order.POSTAL_CODE = address.postal_code;
      order.CITY = address.locality || address.sublocality;
      order.STATE = address.administrative_area_level_1;
      order.COUNTRY = address.country;
    }
  } catch (e) {
    order.ERROR = e;
  }

  return order;
}
