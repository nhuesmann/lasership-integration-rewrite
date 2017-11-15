const expect = require('chai').expect;

const testDirectory = `${__dirname}/../test`;
const seed = require(`${testDirectory}/seed.js`);
const csvHelper = require('./csv-helper.js');
const csvRootDirectory = `${testDirectory}/csv`;
const csvSplitDir = `${csvRootDirectory}/split-by-tnt`;

describe('The csv helper module', function () {
  before(seed.setupCsvs);

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
    let savedCsv = await csvHelper.writeCsv(
      `${csvSplitDir}/split-csvs`, 'csv-write-test.csv', seed.testOrderString
    );

    let foundCsvs = csvHelper.getCsvNames(`${csvSplitDir}/split-csvs`);
    expect(foundCsvs).to.be.an('array');
    expect(foundCsvs).to.have.lengthOf(1);
    expect(foundCsvs[0]).to.equal('csv-write-test.csv');
  });

  it('archiveCsv() moves the csv to archive folder', async function () {
    await csvHelper.archiveCsv('csv-test.csv', `${testDirectory}/seed`, `${csvSplitDir}/archive`);
    let origin = csvHelper.getCsvNames(`${testDirectory}/seed`);
    let archived = csvHelper.getCsvNames(`${csvSplitDir}/archive`);

    expect(origin).to.be.an('array');
    expect(origin).to.not.include('csv-test.csv');
    expect(archived).to.be.an('array');
    expect(archived).to.include('csv-test.csv');
  });

  it('trackingCsv() creates the tracking number csv', async function () {
    let trackingDir = `${csvRootDirectory}/submit-lasership-orders/tracking_numbers`;

    await csvHelper.trackingCsv(
      seed.orderTrackingObjects, 'csv-tracking-test.csv', trackingDir
    );

    let trackingCsv = csvHelper.getCsvNames(trackingDir);

    expect(trackingCsv).to.be.an('array');
    expect(trackingCsv).to.include('csv-tracking-test.csv');
  });

  after(seed.cleanUp);
});
