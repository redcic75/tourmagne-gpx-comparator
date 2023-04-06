const fs = require('fs/promises');

// Loads files
// -> [gpxStrings]
const getGpxStr = async (refPath, challPath) => {
  const refPromise = fs.readFile(refPath, { encoding: 'utf8' });
  const challPromise = fs.readFile(challPath, { encoding: 'utf8' });
  return Promise.all([refPromise, challPromise]);
};

module.exports = getGpxStr;
