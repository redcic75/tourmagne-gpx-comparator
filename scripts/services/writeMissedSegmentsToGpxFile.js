const fs = require('fs/promises');
const path = require('path');

const generateGpxStr = require('./generateGpxStr');

const writeMissedSegmentsToGpxFile = async (results) => {
  const {
    missedSegments,
    inputs,
  } = results;

  // Generate the file containing the missed segments
  const gpxStr = await generateGpxStr(missedSegments);

  // Write GPX file on disk
  const outputFilePath = path.resolve(__dirname, `../../data/generated_files/missed-${path.basename(inputs.refPath, '.gpx')}-${path.basename(inputs.challPath, '.gpx')}-${inputs.options.trigger}-${inputs.options.tolerance}-${inputs.options.maxDetour}.gpx`);
  await fs.writeFile(outputFilePath, gpxStr);
};

module.exports = writeMissedSegmentsToGpxFile;
