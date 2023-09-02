const path = require('path');

module.exports = {
  entry: './scripts/indexWeb.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'scripts'),
  },
};
