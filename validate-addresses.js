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
main(csvs); // TODO: rename this function!

async function main (csvNames) {
  for (let csvName of csvNames) {
    try {
      const buffer = await getCsvData(csvDirectory, csvName);
      let orders = parseCsv(buffer);

      orders = orders.map(order => {
        let randInterval = Math.floor((Math.random() * 2000) + 1);
        return setTimeoutPromise(randInterval, validateAddress(order));
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
}

async function validateAddress (order) {
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

      order.VALIDATED_ADDRESS = res.json.results[0].formatted_address;
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
