require('./config/config');
const { getCsvNames, getCsvData, parseCsv, stringifyCsv, writeCsv, archiveCsv } = require('./utils/csv-helper');
const csvDirectory = `${__dirname}/csv/split-by-tnt`;

const csvs = getCsvNames(csvDirectory);
csvs.forEach(csv => main(csv));

async function main (csvName) {
  try {
    const buffer = await getCsvData(csvDirectory, csvName);
    const orders = parseCsv(buffer);
    const tntObject = splitByTnt(orders);

    for (var tnt in tntObject) {
      if (tntObject.hasOwnProperty(tnt)) {
        let csvString = await stringifyCsv(tntObject[tnt]);
        let newName = csvName.replace('.csv', `_Lasership_${tnt.replace('tnt', '')}Day.csv`);
        await writeCsv(`${csvDirectory}/split-csvs`, newName, csvString);
      }
    }

    await archiveCsv(csvName, csvDirectory, `${csvDirectory}/archive`);

  } catch (e) {
    console.log(e);
  }
}

function splitByTnt (orders) {
  return orders.reduce((prev, curr) => {
    curr.tnt = parseInt(curr.tnt);
    prev[`tnt${curr.tnt}`]
      ? prev[`tnt${curr.tnt}`].push(curr)
      : prev[`tnt${curr.tnt}`] = [curr];
    return prev;
  }, {});
}
