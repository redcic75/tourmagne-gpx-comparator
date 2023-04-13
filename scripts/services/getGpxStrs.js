const fs = require('fs/promises');

// Loads files
// -> [gpxStrings]
const getGpxStrs = async (paths) => {
  const promises = paths.map((path) => fs.readFile(path, { encoding: 'utf8' }));
  return Promise.all(promises);
};

module.exports = getGpxStrs;
