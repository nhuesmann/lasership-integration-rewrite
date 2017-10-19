require('./config/config');

const { submitOrder } = require('./utils/lasership-helper');
const { getCsvNames, getCsvData, parseCsv, stringifyCsv, writeCsv, archiveCsv } = require('./utils/csv-helper');
const csvDirectory = `${__dirname}/csv/submit-lasership-orders`;

const csvs = getCsvNames(csvDirectory);


// run them all through the submit function (synchronously? test async first)
submitOrder('test');
