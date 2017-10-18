require('./config/config');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

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

const csvs = getCsvNames(csvDirectory);
main(csvs); // TODO: rename this function!

async function main (csvNames) {
  for (let csvName of csvNames) {
    try {
      const buffer = await getCsvData(csvDirectory, csvName);
      let orders = parseCsv(buffer);

      orders = orders.map(order => {
        let randInterval = Math.floor((Math.random() * 300) + 1);
        return setTimeoutPromise(randInterval, geocodeAndValidate(order));
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

async function geocodeAndValidate (order) {
  const address = order.address_2 ? `${order.address_1} ${order.address_2}` : order.address_1;

  try {
    let res = await googleMapsClient.geocode({
      address
    }).asPromise();

    if (res.json.status !== 'OK') {
      order.error = res.json.status;
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
      delete order.error;
      delete order.error_detail;
    }
  } catch (e) {
    order.error = e;
  }

  return order;
}

async function createOrUpdateCsvs (csvName, validatedOrders, failedOrders) {
  const validatedDir = `${csvDirectory}/validated`;
  const validated = getCsvNames(validatedDir);

  if (validated.indexOf(csvName) > -1) {
    const buffer = await getCsvData(validatedDir, csvName);
    let priorValidOrders = parseCsv(buffer);
    validatedOrders = priorValidOrders.concat(validatedOrders);
  }

  validatedOrders.sort((a, b) => a.sales_order - b.sales_order);
  failedOrders.sort((a, b) => a.sales_order - b.sales_order);

  let validatedCsvString = await stringifyCsv(validatedOrders);
  let failedCsvString = await stringifyCsv(failedOrders);

  await writeCsv(`${csvDirectory}/validated`, `${csvName}`, validatedCsvString);
  await writeCsv(`${csvDirectory}/failed`, `${csvName}`, failedCsvString);
}
