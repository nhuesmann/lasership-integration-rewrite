const moment = require('moment');
const fs = require('fs-extra');
const path = require('path');

const date = moment.utc().format('YYYY-MM-DD kk:mm:ss');
const logPath = path.join(__dirname, '../lasership.log');

function log (caller, message) {
  message = `${date} [${caller}]: ${message}`;
  console.log(message);
  fs.appendFile(logPath, `${message}\n`);
}

module.exports = {
  log
};
