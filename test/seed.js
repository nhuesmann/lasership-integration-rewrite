const fs = require('fs');
const path = require('path');

const pdfDirectory = `${__dirname}/pdf`;
const today = new Date().toLocaleDateString('en-US');

const testOrderString = `sales_order,contact_name,company_name,address_1,address_2,postal_code,city,state,country,telephone,residential_commercial,shipping_method,bill_transportation_to,package_type,weight,special_delivery_instructions,ship_date,reference,tnt\n123456,Nathan Huesmann,,291 Coral Circle,,90245,El Segundo,CA,US,3105311935,YES,90,1,1,10,,${today},TEST ORDER,1\n`;

const testOrder = {
  sales_order: '123456',
  contact_name: 'Nathan Huesmann',
  company_name: '',
  address_1: '291 Coral Circle',
  address_2: '',
  postal_code: '90245',
  city: 'El Segundo',
  state: 'CA',
  country: 'US',
  telephone: '3105311935',
  residential_commercial: 'YES',
  shipping_method: '90',
  bill_transportation_to: '1',
  package_type: '1',
  weight: '10',
  special_delivery_instructions: '',
  ship_date: today,
  reference: 'TEST ORDER',
  tnt: 1,
};

const validOrder = {
  sales_order: '123456',
  contact_name: 'Nathan Huesmann',
  company_name: '',
  address_1: '291 Coral Circle',
  address_2: '',
  postal_code: '90245',
  city: 'El Segundo',
  state: 'CA',
  country: 'US',
  telephone: '3105311935',
  residential_commercial: 'YES',
  shipping_method: '90',
  bill_transportation_to: '1',
  package_type: '1',
  weight: '10',
  special_delivery_instructions: '',
  ship_date: today,
  reference: 'TEST ORDER - VALID',
  tnt: 2,
  carrier: 'LaserShip',
};

const invalidOrder = {
  sales_order: '666666',
  contact_name: '',
  company_name: '',
  address_1: '',
  address_2: '291 Coral Circle',
  postal_code: '90245',
  city: 'El Segundo',
  state: 'CA',
  country: 'US',
  telephone: '3105311935',
  residential_commercial: 'YES',
  shipping_method: '90',
  bill_transportation_to: '1',
  package_type: '1',
  weight: '10',
  special_delivery_instructions: '',
  ship_date: today,
  reference: 'TEST ORDER - INVALID',
  tnt: 2,
  carrier: 'LaserShip',
};

const orderToCleanse = {
  sales_order: '654321',
  contact_name: 'Nathan Huesmann',
  company_name: '',
  address_1: '291 Coral Circle',
  address_2: 'parking lot',
  postal_code: '1234',
  city: 'El Segundo',
  state: 'CA',
  country: 'US',
  telephone: '(310) 531-1935',
  residential_commercial: 'YES',
  shipping_method: '90',
  bill_transportation_to: '1',
  package_type: '1',
  weight: '10',
  special_delivery_instructions: 'Please leave it in the middle of the parking lot',
  ship_date: today,
  reference: 'TEST ORDER - NEEDS CLEANSING',
  tnt: 2,
  carrier: 'LaserShip',
};

const orderTrackingObjects = [
  {
    order: '123456',
    tracking: 'trackingnumber1',
  },
  {
    order: '654321',
    tracking: 'trackingnumber2',
  },
];

function setupCsvs() {
  fs.writeFileSync(`${__dirname}/csv/split-by-tnt/csv-test.csv`, testOrderString);
  fs.writeFileSync(`${__dirname}/seed/csv-test.csv`, testOrderString);

  fs.createReadStream(`${__dirname}/seed/lasership-zipcodes.csv`)
    .pipe(fs.createWriteStream(`${__dirname}/csv/split-by-tnt/lasership-zipcodes/lasership-zipcodes.csv`));
}

function cleanUp() {
  walkSync(`${__dirname}/csv`)
    .filter(file => file.endsWith('.csv') || file.endsWith('.txt'))
    .forEach(path => fs.unlinkSync(path));
}

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {

    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });

  return filelist;
}

module.exports = {
  setupCsvs,
  cleanUp,
  testOrder,
  testOrderString,
  orderTrackingObjects,
};
