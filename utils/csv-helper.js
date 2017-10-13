const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify');
const fs = require('fs-extra');

/**
 * Retrieves the names of all CSVs in the target directory.
 * @param {string} csvDirectory The path of the CSV directory.
 * @return {array} An array of CSV name strings.
 */
function getCsvNames (csvDirectory) {
  return fs.readdirSync(csvDirectory).filter(filename => {
    return filename.endsWith('.csv');
  });
};

/**
 * Reads the CSV.
 * @param {string} csvDirectory The path of the CSV directory.
 * @param {string} csvName The name of the CSV.
 * @return {buffer} Buffer representing the CSV.
 */
function getCsvData (csvDirectory, csvName) {
  return fs.readFile(`${csvDirectory}/${csvName}`);
};

/**
 * Converts the order lines in the CSV to an array of order objects.
 * @param {buffer} buffer Buffer representing the CSV.
 * @return {array} Array of order objects.
 */
function parseCsv (buffer) {
  return parse(buffer, {columns: validateHeaders});
};

/**
 * Converts order objects into a CSV string.
 * @param  {array} orders Array of order objects.
 * @return {Promise} Resolves with the string, rejects any error.
 */
function stringifyCsv (orders) {
  let columns = Object.keys(orders[0]).reduce((prev, curr) => {
    prev[curr] = curr;
    return prev;
  }, {});

  return new Promise((resolve, reject) => {
    stringify(orders, {
      columns,
      header: true
    }, (err, output) => {
      if (err) {
        reject(err);
      }
      resolve(output);
    });
  });
}

/**
 * Writes CSV file to disk.
 * @param  {string} csvDirectory The path of the CSV directory.
 * @param  {string} csvName      The name of the CSV.
 * @param  {string} csvString    The stringified CSV.
 * @return {Promise}             Resolves if write was successful, rejects any error.
 */
function writeCsv (csvDirectory, csvName, csvString) {
  return fs.writeFile(`${csvDirectory}/${csvName}`, csvString);
}

/**
 * Archives the original CSVs that were split.
 * @param  {string} currentDir Source CSV directory.
 * @param  {string} archiveDir Target CSV archive directory.
 */
function archiveCsvs (currentDir, archiveDir) {
  let csvNames = getCsvNames(currentDir);
  let csvs = csvNames.map(name => {
    return {
      src: `${currentDir}/${name}`,
      destination: `${archiveDir}/${name}`
    };
  });
  csvs.forEach(csv => fs.moveSync(csv.src, csv.destination));
}

/**
 * Converts CSV headers into valid strings usable as object properties.
 * @param  {array} headers Original column headers.
 * @return {array} Renamed column headers.
 */
function validateHeaders (headers) {
  return headers.map(function(header) {
    return header.replace(/\W/g, " ").replace(/\s+/g, "_").toUpperCase();
  });
};

module.exports = {
  getCsvNames,
  getCsvData,
  parseCsv,
  stringifyCsv,
  writeCsv,
  archiveCsvs
};
