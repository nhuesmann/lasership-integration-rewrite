const expect = require('chai').expect;

const seed = require(`${__dirname}/../test/seed.js`);
const csvHelper = require('./csv-helper.js');
const csvRootDirectory = `${__dirname}/../test/csv`;
const csvSplitDir = `${csvRootDirectory}/split-by-tnt`;

describe('The csv helper module', function () {
  before(seed.createCsv);

  it('getCsvNames() gets the csv names', function () {
    let names = csvHelper.getCsvNames(csvSplitDir);

    expect(names).to.be.an('array');
    expect(names).to.have.lengthOf(1);
    expect(names[0]).to.equal('csv-test.csv');
  });

  it('getCsvData() gets the csv buffer', async function () {
    let csvPromise = csvHelper.getCsvData(csvSplitDir, 'csv-test.csv');

    expect(csvPromise).to.be.a('promise');
    expect(await csvPromise).to.be.instanceof(Buffer);
  });

  it('parseCsv() gets the csv data', async function () {
    let buffer = await csvHelper.getCsvData(csvSplitDir, 'csv-test.csv');
    let csvData = csvHelper.parseCsv(buffer);

    expect(csvData).to.be.an('array');
    expect(csvData).to.have.lengthOf(1);

    let order = csvData[0];

    expect(order).to.be.an('object');
    expect(order).to.have.own.property('contact_name');
    expect(order.contact_name).to.equal('Nathan Huesmann');
  });

  it('stringifyCsv() creates a csv string', async function () {
    let csvData = [seed.testOrder];
    let csvString = await csvHelper.stringifyCsv(csvData);

    expect(csvString).to.equal(seed.testOrderString);
  });

  it('writeCsv() writes the csv to disk', async function () {

  });

  it('archiveCsv() moves the csv to archive folder', async function () {

  });

  it('trackingCsv() creates the tracking number csv', async function () {

  });
});
