const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

const seed = require(path.join(__dirname, '../test/seed.js'));
const labelHelper = require('./label-helper.js');
const csvName = 'label-test';
const pdfDirectory = path.join(__dirname, '../test/pdf');
const pdfTempDir = `${pdfDirectory}/temp/${csvName}`;
const pdfMergedDir = `${pdfDirectory}/merged-labels`;
const pdfArchiveDir = `${pdfDirectory}/archive/label-test`;

describe('The label helper module', function () {
  before(seed.setupPdfs);

  it('saveLabelAndTracking() should save label to disk and return tracking number', async function () {
    let labelTrackingObj = await labelHelper.saveLabelAndTracking(pdfDirectory, seed.lsResponse, `${csvName}.csv`);
    expect(labelTrackingObj).to.be.an('object').that.includes({
      order: '123456',
      label: `${pdfDirectory}/temp/${csvName}/123456.pdf`
    });
    expect(labelTrackingObj).to.have.property('tracking');

    let pdfNames = fs.readdirSync(pdfTempDir).filter(filename => filename.endsWith('.pdf'));
    expect(pdfNames).to.be.an('array').that.includes('123456.pdf');
  });

  it('mergeLabels() should merge all shipping labels into a single PDF', async function () {
    await labelHelper.mergeLabels(pdfDirectory, seed.labelPaths, `${csvName}.csv`);

    let pdfNames = fs.readdirSync(pdfMergedDir).filter(filename => filename.endsWith('.pdf'));
    expect(pdfNames).to.be.an('array').that.includes(`${csvName}.pdf`);
  });

  it('archiveLabels() should move all individual PDFs to a new archive folder', async function () {
    await labelHelper.archiveLabels(pdfDirectory, seed.labelObjects, `${csvName}.csv`);

    let pdfNames = fs.readdirSync(pdfArchiveDir).filter(filename => filename.endsWith('.pdf'));
    expect(pdfNames).to.be.an('array');
    expect(pdfNames).to.have.members(['123456.pdf', '654321.pdf']);

    pdfNames = fs.readdirSync(`${pdfDirectory}/temp`).filter(filename => filename.endsWith('.pdf'));
    expect(pdfNames).to.be.an('array').that.is.empty;
  });

  after(() => {
    seed.cleanUp('pdf');
  });
});
