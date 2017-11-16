const fs = require('fs-extra');
const PDFMerge = require('pdf-merge');
// const path = require('path');

// const pdfDirectory = path.join(__dirname, '../pdf');
const pdftkPath = '/usr/local/bin/pdftk';
// const pdfMergedDir = `${pdfDirectory}/merged-labels`;

/**
 * Writes the label buffer from the response to disk and retrieves the tracking number.
 * @param  {string} res     The JSON string response.
 * @param  {string} csvName The name of the CSV.
 * @return {object}         An object containing the order number, PDF path, and tracking number.
 */
function saveLabelAndTracking(pdfDirectory, res, csvName) {
  res = JSON.parse(res);
  let reference = res.Order.CustomerOrderNumber;
  let tracking = res.Order.Pieces[0].LaserShipBarcode;
  let labelBuffer = Buffer.from(res.Order.Label, 'base64');

  let pdfTempDir = `${pdfDirectory}/temp/${csvName.replace('.csv', '')}`;
  let pdfPath = `${pdfTempDir}/${reference}.pdf`;
  fs.ensureDirSync(pdfTempDir);

  return fs.writeFile(pdfPath, labelBuffer)
    .then((savedPDF) => ({
      order: reference,
      label: pdfPath,
      tracking,
    }));
}

/**
 * Merges all shipping label PDFs into a single PDF.
 * @param  {array} labelPaths Array of all label paths in the temp directory.
 * @param  {string} csvName   The name of the CSV.
 * @return {Promise}          Resolves if successful, rejects a new Error.
 */
function mergeLabels(pdfDirectory, labelPaths, csvName) {
  let pdfPath = `${pdfDirectory}/merged-labels/${csvName.replace('.csv', '.pdf')}`;
  if (fs.pathExistsSync(pdfPath)) pdfPath = pdfPath.replace('.pdf', '-1.pdf');

  return PDFMerge(labelPaths, { libPath: pdftkPath })
    .then((buffer) => fs.writeFile(pdfPath, buffer))
    .then((data) => data)
    .catch((e) => new Error(e));
}

/**
 * Moves all individual PDFs to a folder labeled by the name of the CSV.
 * @param  {array} labelObjects Array of the order/label path/tracking objects.
 * @param  {string} csvName     The name of the CSV.
 * @return {Promise}            Resolves if successful, rejects with an error.
 */
function archiveLabels(pdfDirectory, labelObjects, csvName) {
  let archiveDir = `${pdfDirectory}/archive/${csvName.replace('.csv', '')}`;

  return Promise.all(labelObjects.map(labelObject =>
    fs.move(labelObject.label, `${archiveDir}/${labelObject.order}.pdf`, { overwrite: true })
  )).then((movedSuccess) =>
    fs.emptyDir(`${pdfDirectory}/temp`)
  );
}

module.exports = {
  saveLabelAndTracking,
  mergeLabels,
  archiveLabels,
};
