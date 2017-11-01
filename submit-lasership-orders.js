require('./config/config');
const Bottleneck = require("bottleneck");
const limiter = new Bottleneck(40);

const { getCsvNames, getCsvData, parseCsv, stringifyCsv, writeCsv, archiveCsv, trackingCsv } = require('./utils/csv-helper');
const { submitOrder } = require('./utils/lasership-helper');
const { saveLabelAndTracking, mergeLabels, archiveLabels } = require('./utils/label-helper');
const { log } = require('./utils/log');

const caller = 'submit-lasership-orders';
const csvDirectory = `${__dirname}/csv/submit-lasership-orders`;

const csvs = getCsvNames(csvDirectory);
submitLasershipOrders(csvs);

async function submitLasershipOrders (csvNames) {
  for (let csvName of csvNames) {
    try {
      const buffer = await getCsvData(csvDirectory, csvName);
      let orders = parseCsv(buffer);
      orders = orders.map(order => {
        return limiter.schedule(submitOrder, order).catch(e => {
          let error;
          if (e.error.constructor === String) {
            try {
              error = JSON.parse(e.error).ErrorMessage;
            } catch(e) {
              error = error.message;
            }
          } else {
            error = error.message;
          }

          order.error = error;
          return order;
        });
      });

      let responses = await Promise.all(orders);
      let failedOrders = responses.filter(res => res.error);
      let successfulOrders = responses.filter(res => !res.error);

      let message = `${csvName} \n- ${successfulOrders.length} orders successfully placed. \n- ${failedOrders.length} orders failed.`;
      log(caller, message);

      if (successfulOrders.length > 0) {
        let labelsWithTracking = await Promise.all(successfulOrders.map(res => {
          return saveLabelAndTracking(res, csvName);
        }));

        await mergeLabels(labelsWithTracking.map(obj => obj.label), csvName);
        await archiveLabels(labelsWithTracking, csvName);
        await trackingCsv(labelsWithTracking, csvName, `${csvDirectory}/tracking_numbers`);
      }

      await archiveCsv(csvName, csvDirectory, `${csvDirectory}/archive`);

      if (failedOrders.length > 0) {
        let failedCsvString = await stringifyCsv(failedOrders);
        await writeCsv(`${csvDirectory}/failed`, `${csvName}`, failedCsvString);
      }
    } catch (e) {
      log(caller, e);
    }
  }
}
