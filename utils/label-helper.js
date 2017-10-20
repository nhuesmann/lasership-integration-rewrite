const fs = require('fs-extra');
const PDFMerge = require('pdf-merge');
const path = require('path');

// const csvDirectory = `${__dirname}/csv/submit-lasership-orders`;
const pdfDirectory = path.join(__dirname, '../pdf');
const pdftkPath = '/usr/local/bin/pdftk';
const pdfMergedDir = `${pdfDirectory}/merged-labels`;

function saveLabelAndTracking (res, csvName) {
  res = JSON.parse(res);
  let reference = res.Order.CustomerOrderNumber;
  let tracking = res.Order.Pieces[0].LaserShipBarcode;
  let labelBuffer = Buffer.from(res.Order.Label, 'base64');

  let pdfTempDir = `${pdfDirectory}/temp/${csvName.replace('.csv', '')}`;
  let pdfPath = `${pdfTempDir}/${reference}.pdf`;
  fs.ensureDirSync(pdfTempDir);

  return fs.writeFile(pdfPath, labelBuffer).then((savedPDF) => {
    return {
      order: reference,
      label: pdfPath,
      tracking
    };
  });
}

function mergeLabels (labelPaths, csvName) {
  return PDFMerge(labelPaths, { libPath: pdftkPath }).then((buffer) => {
    return fs.writeFile(`${pdfMergedDir}/${csvName.replace('.csv', '.pdf')}`, buffer);
  })
  .then((data) => data)
  .catch((e) => {
    return new Error(e);
  });
}

function archiveLabels (labelObjects, csvName) {
  let archiveDir = `${pdfDirectory}/archive/${csvName.replace('.csv', '')}`;

  return Promise.all(labelObjects.map(labelObject => {
    return fs.move(labelObject.label, `${archiveDir}/${labelObject.order}.pdf`);
  })).then((movedSuccess) => {
    return fs.emptyDir(`${pdfDirectory}/temp`);
  });
}

module.exports = {
  saveLabelAndTracking,
  mergeLabels,
  archiveLabels
};
