require('./config/config');
const { getCsvNames, getCsvData, parseCsv, stringifyCsv, writeCsv, archiveCsv } = require('./utils/csv-helper');
const { log } = require('./utils/log');

const caller = 'split-by-tnt';
const csvDirectory = `${__dirname}/csv/split-by-tnt`;
const lsZipsDirectory = `${csvDirectory}/lasership-zipcodes`;

main();

async function main () {
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

async function splitByTnt (csvName, lsZips) {
  try {
    const buffer = await getCsvData(csvDirectory, csvName);
    const orders = parseCsv(buffer);

    let { lasershipOrders, nonLasershipOrders } = filterLsZips(orders, lsZips);

    if (nonLasershipOrders.length > 0) {
      let nonLsString = await stringifyCsv(nonLasershipOrders);
      writeCsv(`${csvDirectory}/split-csvs/non-lasership`, csvName, nonLsString);
    }

    const tntObject = filterTnt(lasershipOrders);

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

function filterTnt (orders) {
  return orders.reduce((prev, curr) => {
    curr.tnt = parseInt(curr.tnt);
    prev[`tnt${curr.tnt}`]
      ? prev[`tnt${curr.tnt}`].push(curr)
      : prev[`tnt${curr.tnt}`] = [curr];
    return prev;
  }, {});
}

function filterLsZips (orders, lsZips) {
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
    nonLasershipOrders
  };
}
