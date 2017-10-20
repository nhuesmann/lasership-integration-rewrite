require('./config/config');
const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const { getCsvNames, getCsvData, parseCsv, stringifyCsv, writeCsv, archiveCsv } = require('./utils/csv-helper');
const { submitOrder } = require('./utils/lasership-helper');
const { saveLabelAndTracking, mergeLabels, archiveLabels } = require('./utils/label-helper');
const csvDirectory = `${__dirname}/csv/submit-lasership-orders`;

const csvs = getCsvNames(csvDirectory);
main(csvs); // TODO: rename this function!

async function main (csvNames) {
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

      let labels = labelsWithTracking.map(obj => obj.label);
      await mergeLabels(labels, csvName);
      await archiveLabels(labelsWithTracking, csvName);

      // TODO: save tracking csv

      // TODO: save csv of failed orders at the end

      // TODO: for all scripts, make sure the catch of the main function LOGS the error and handles it somehow!
      // TODO: for all scripts - add console logging for all stages for user

    } catch (e) {
      console.log(e);
    }
  }
}
