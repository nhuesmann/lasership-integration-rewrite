const fs = require('fs-extra');
const jsonfile = require('jsonfile');

const directories = [
  `${__dirname}/csv/split-by-tnt/archive`,
  `${__dirname}/csv/split-by-tnt/split-csvs`,
  `${__dirname}/config`
];

const configJson = {
  'GOOGLE_API_KEY': '',
  'LASERSHIP_API_ID': '',
  'LASERSHIP_API_KEY': ''
};

directories.forEach(directory => fs.ensureDirSync(directory));
jsonfile.writeFileSync(`${__dirname}/config/config.json`, configJson, {spaces: 2});
