const fs = require('fs-extra');
const jsonfile = require('jsonfile');

function ensureDirs(directory) {
  let dirs = [
    `${directory}/csv/split-by-tnt/archive`,
    `${directory}/csv/split-by-tnt/lasership-zipcodes`,
    `${directory}/csv/split-by-tnt/split-csvs`,
    `${directory}/csv/split-by-tnt/split-csvs/non-lasership`,
    `${directory}/csv/submit-lasership-orders/archive`,
    `${directory}/csv/submit-lasership-orders/failed`,
    `${directory}/csv/submit-lasership-orders/tracking_numbers`,
    `${directory}/csv/validate-addresses/archive`,
    `${directory}/csv/validate-addresses/failed`,
    `${directory}/csv/validate-addresses/validated`,
    `${directory}/pdf/archive`,
    `${directory}/pdf/merged-labels`,
    `${directory}/pdf/temp`,
  ];
  dirs.forEach(dir => fs.ensureDirSync(dir));
}

const configJson = {
  'production': {
    'GOOGLE_API_KEY': '',
    'LASERSHIP_API_ID': '',
    'LASERSHIP_API_KEY': ''
  },
  'development': {
    'GOOGLE_API_KEY': '',
    'LASERSHIP_API_ID': '',
    'LASERSHIP_API_KEY': ''
  },
  'test': {
    'GOOGLE_API_KEY': '',
    'LASERSHIP_API_ID': '',
    'LASERSHIP_API_KEY': ''
  }
};

fs.ensureDirSync(`${__dirname}/config`);
ensureDirs(__dirname);
ensureDirs(`${__dirname}/test`);
jsonfile.writeFileSync(`${__dirname}/config/config.json`, configJson, {spaces: 2});
