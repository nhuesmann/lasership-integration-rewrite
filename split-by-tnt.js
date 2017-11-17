require('./config/config');
const { getCsvNames, getCsvData, parseCsv, stringifyCsv, writeCsv, archiveCsv } = require('./utils/csv-helper');
const { log } = require('./utils/log');

const caller = 'split-by-tnt';
const csvDirectory = `${__dirname}/csv/split-by-tnt`;
const lsZipsDirectory = `${csvDirectory}/lasership-zipcodes`;

main();

async function main() {
  // Load, parse, and cleanse the zip codes CSV
  let buffer = await getCsvData(lsZipsDirectory, 'lasership-zipcodes.csv');
  let lasershipZips = parseCsv(buffer);
  lasershipZips = lasershipZips.reduce((prev, curr) => {
    let zip = curr.zipcode.length === 4 ? `0${curr.zipcode}` : curr.zipcode;
    prev.push(zip);
    return prev;
  }, []);

  const csvs = getCsvNames(csvDirectory);
  csvs.forEach(csv => splitByTnt(csv, lasershipZips));
}

/**
 * Filters by lasership/non-lasership zip codes, then creates separate csvs for
 * each TNT found on the order form.
 * @param  {string} csvName The name of the csv.
 * @param  {array} lsZips   An array of all Lasership zip codes.
 */
async function splitByTnt(csvName, lsZips) {
  try {
    const buffer = await getCsvData(csvDirectory, csvName);
    const orders = parseCsv(buffer);

    // Separate orders by lasership and non-lasership zips for later processing
    let { lasershipOrders, nonLasershipOrders } = filterLsZips(orders, lsZips);

    if (nonLasershipOrders.length > 0) {
      let nonLsString = await stringifyCsv(nonLasershipOrders);
      writeCsv(`${csvDirectory}/split-csvs/non-lasership`, csvName, nonLsString);
    }

    // Build an object with properties matching the different TNT values
    const tntObject = filterTnt(lasershipOrders);

    // Create a separate CSV for each TNT value
    for (var tnt in tntObject) {
      if (tntObject.hasOwnProperty(tnt)) {
        let csvString = await stringifyCsv(tntObject[tnt]);
        let newName = csvName.replace('.csv', `_Lasership_${tnt.replace('tnt', '')}Day.csv`);
        await writeCsv(`${csvDirectory}/split-csvs`, newName, csvString);
      }
    }

    await archiveCsv(csvName, csvDirectory, `${csvDirectory}/archive`);

    let message = `${csvName} split successfully.`;
    log(caller, message);

  } catch (e) {
    log(caller, e);
  }
}

/**
 * Creates an enum object for each TNT present in the orders array.
 * @param  {array} orders The orders from the csv.
 * @return {object}       An enum object with properties matching all TNTs from
 * the csv. The value for each property is an array of orders with that TNT.
 */
function filterTnt(orders) {
  return orders.reduce((prev, curr) => {
    curr.tnt = parseInt(curr.tnt);
    prev[`tnt${curr.tnt}`]
      ? prev[`tnt${curr.tnt}`].push(curr)
      : prev[`tnt${curr.tnt}`] = [curr];
    return prev;
  }, {});
}

/**
 * Filters orders by eligibility for lasership based on zip code.
 * @param  {array} orders The orders from the csv.
 * @param  {array} lsZips The zip codes lasership services.
 * @return {object}       An object containing an array of orders eligible for
 * lasership and an array of orders outside the lasership service area.
 */
function filterLsZips(orders, lsZips) {
  orders = orders.map(order => {
    let zip = order.postal_code;
    zip = zip.length === 4 ? `0${zip}` : zip;
    order.isLsZip = lsZips.includes(zip);
    return order;
  });

  let lasershipOrders = orders.filter(order => order.isLsZip).map(order => {
    delete order.isLsZip;
    return order;
  });

  let nonLasershipOrders = orders.filter(order => !order.isLsZip).map(order => {
    delete order.isLsZip;
    return order;
  });

  return {
    lasershipOrders,
    nonLasershipOrders,
  };
}
