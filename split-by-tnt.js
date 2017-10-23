require('./config/config');
const { getCsvNames, getCsvData, parseCsv, stringifyCsv, writeCsv, archiveCsv } = require('./utils/csv-helper');
const { log } = require('./utils/log');

const caller = 'split-by-tnt';
const csvDirectory = `${__dirname}/csv/split-by-tnt`;

const csvs = getCsvNames(csvDirectory);
csvs.forEach(csv => splitByTnt(csv));

async function splitByTnt (csvName) {
  try {
    const buffer = await getCsvData(csvDirectory, csvName);
    const orders = parseCsv(buffer);
    const tntObject = filterOrders(orders);

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

function filterOrders (orders) {
  return orders.reduce((prev, curr) => {
    curr.tnt = parseInt(curr.tnt);
    prev[`tnt${curr.tnt}`]
      ? prev[`tnt${curr.tnt}`].push(curr)
      : prev[`tnt${curr.tnt}`] = [curr];
    return prev;
  }, {});
}
