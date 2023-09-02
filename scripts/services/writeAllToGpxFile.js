const fs = require('fs/promises');
const path = require('path');

const generateFullGpxStr = require('./generateFullGpxStr');

const writeAllToGpxFile = async (results) => {
  // Generate the file containing the missed segments
  const gpxStr = generateFullGpxStr(results);

  // Write GPX file on disk
  const outputFilePath = path.resolve(__dirname, '../../data/output/gpsvisualizerSynthesis.gpx');
  await fs.writeFile(outputFilePath, gpxStr);
};

module.exports = writeAllToGpxFile;
