require('./config/config');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const { getCsvNames, getCsvData, parseCsv, stringifyCsv, writeCsv, archiveCsv, trackingCsv } = require('./utils/csv-helper');
const { submitOrder } = require('./utils/lasership-helper');
const { saveLabelAndTracking, mergeLabels, archiveLabels } = require('./utils/label-helper');
const csvDirectory = `${__dirname}/csv/submit-lasership-orders`;

const csvs = getCsvNames(csvDirectory);
submitLasershipOrders(csvs);

async function submitLasershipOrders (csvNames) {
  for (let csvName of csvNames) {
    try {
      const buffer = await getCsvData(csvDirectory, csvName);
      let orders = parseCsv(buffer);

      orders = orders.map(order => {
        let randInterval = Math.floor((Math.random() * 300) + 1);
        return setTimeoutPromise(randInterval, order).then((order) => submitOrder(order))
          .catch(e => {
            order.error = JSON.parse(e.error).ErrorMessage;
            return order;
          });
      });

      let responses = await Promise.all(orders);
      let failedOrders = responses.filter(res => res.error);
      let successfulOrders = responses.filter(res => !res.error);

      // TODO: log the successes and failures. Add comprehensive logging

      let labelsWithTracking = await Promise.all(successfulOrders.map(res => {
        return saveLabelAndTracking(res, csvName);
      }));

      await mergeLabels(labelsWithTracking.map(obj => obj.label), csvName);
      await archiveLabels(labelsWithTracking, csvName);
      await trackingCsv(labelsWithTracking, csvName, `${csvDirectory}/tracking_numbers`);
      await archiveCsv(csvName, csvDirectory, `${csvDirectory}/archive`);

      if (failedOrders.length > 0) {
        let failedCsvString = await stringifyCsv(failedOrders);
        await writeCsv(`${csvDirectory}/failed`, `${csvName}`, failedCsvString);
      }

      // TODO: for all scripts, make sure the catch of the main function LOGS the error and handles it somehow!
    } catch (e) {
      console.log(e);
    }
  }
}
