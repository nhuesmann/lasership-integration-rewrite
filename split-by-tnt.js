const { getCsvNames, getCsvData, parseCsv, stringifyCsv, writeCsv, archiveCsvs } = require('./utils/csv-helper');
const csvDirectory = `${__dirname}/csv/split-by-tnt`;

const csvs = getCsvNames(csvDirectory);
csvs.forEach(csv => main(csv));
archiveCsvs(csvDirectory, `${csvDirectory}/archive`);

async function main (csvName) {
  try {
    const buffer = await getCsvData(csvDirectory, csvName);
    const orders = parseCsv(buffer);
    const tntObject = splitByTnt(orders);

    for (var tnt in tntObject) {
      if (tntObject.hasOwnProperty(tnt)) {
        let csvString = await stringifyCsv(tntObject[tnt]);
        let newName = csvName.replace('.csv', `_Lasership_${tnt.replace('TNT', '')}Day.csv`);
        await writeCsv(`${csvDirectory}/split-csvs`, newName, csvString);
      }
    }
  } catch (e) {
    console.log(e);
  }
}

function splitByTnt (orders) {
  return orders.reduce((prev, curr) => {
    curr.TNT = parseInt(curr.TNT);
    prev[`TNT${curr.TNT}`]
      ? prev[`TNT${curr.TNT}`].push(curr)
      : prev[`TNT${curr.TNT}`] = [curr];
    return prev;
  }, {});
}
