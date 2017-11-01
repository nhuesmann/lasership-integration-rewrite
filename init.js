const fs = require('fs-extra');
const jsonfile = require('jsonfile');

const directories = [
  `${__dirname}/config`,
  `${__dirname}/csv/split-by-tnt/archive`,
  `${__dirname}/csv/split-by-tnt/lasership-zipcodes`,
  `${__dirname}/csv/split-by-tnt/split-csvs`,
  `${__dirname}/csv/split-by-tnt/split-csvs/non-lasership`,
  `${__dirname}/csv/submit-lasership-orders/archive`,
  `${__dirname}/csv/submit-lasership-orders/failed`,
  `${__dirname}/csv/submit-lasership-orders/tracking_numbers`,
  `${__dirname}/csv/validate-addresses/archive`,
  `${__dirname}/csv/validate-addresses/failed`,
  `${__dirname}/csv/validate-addresses/validated`,
  `${__dirname}/pdf/archive`,
  `${__dirname}/pdf/merged-labels`,
  `${__dirname}/pdf/temp`
];

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

directories.forEach(directory => fs.ensureDirSync(directory));
jsonfile.writeFileSync(`${__dirname}/config/config.json`, configJson, {spaces: 2});
