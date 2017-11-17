# LaserShip Order Integration

Parses a CSV of customer orders and creates LaserShip shipments for them. Merges
all shipping labels into a single PDF for easy printing at the warehouse packing
station.

## Installation

* Download the repo.
* From the terminal, run `npm install` to install all required
dependencies.
* Run `npm run init` to set up all required folders and `config.json`.
* Edit `config.json`, entering in your API keys for each field.
* Download and install [PDFTK](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/pdftk_server-2.02-mac_osx-10.11-setup.pkg).

## Usage

There are 3 primary modules.

### [split-by-tnt](./split-by-tnt.js)
Splits a CSV by order TNT, saving the resulting CSVs in the folder `csv/split-by-tnt/split-csvs`.

**To use:**
Copy all CSVs into the root of `csv/split-by-tnt`. Then, from the console:
```shell
$ npm run split-by-tnt
```

### [validate-addresses](./validate-addresses.js)
Submits all orders to Google Geocode API for address validation. Addresses are
then sent to Google Timezone API to retrieve the destination timezone offset.
Resulting CSVs will be saved in `csv/validate-addresses` in `validated` and `failed` folders.

**To use:**
Copy all CSVs into the root of `csv/validate-addresses`. Then, from the console:
```shell
$ npm run validate-addresses
```

### [submit-lasership-orders](./submit-lasership-orders.js)
Submits all orders to Lasership API. Retrieves and merges shipping labels for each
CSV. Creates separate CSV with order numbers and tracking numbers. Merged PDFs
will be saved in `pdf/merged-labels`. Tracking CSVs will be saved in
`csv/submit-lasership-orders/tracking_numbers`

**To use:**
Copy all CSVs into the root of `csv/submit-lasership-orders`. Then, from the console:

**FOR STAGING**
```shell
$ npm run submit-staging-orders
```

**FOR PRODUCTION**
```shell
$ npm run submit-production-orders
```

All script activity and/or errors will be logged in `lasership.log`.

## Tests

Tests cover all utility modules used by the main process.
```shell
$ npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
