const fs = require('fs/promises');
const path = require('path');

const generateGpxStr = require('./generateGpxStr');

const writeMissedSegmentsToGpxFile = async (inputParams, results) => {
  const { missedSegments } = results;

  // Generate the file containing the missed segments
  const gpxStr = await generateGpxStr(missedSegments);

  // Write GPX file on disk
  const outputFilePath = path.resolve(__dirname, `../../data/generated_files/missed-${path.basename(inputParams.refPath, '.gpx')}-${path.basename(inputParams.challPath, '.gpx')}-${inputParams.options.trigger}-${inputParams.options.tolerance}-${inputParams.options.maxDetour}.gpx`);
  await fs.writeFile(outputFilePath, gpxStr);
};

module.exports = writeMissedSegmentsToGpxFile;
