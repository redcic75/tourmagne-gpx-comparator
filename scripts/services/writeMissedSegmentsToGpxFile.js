const fs = require('fs/promises');
const path = require('path');

const generateGpxStr = async (segments) => {
  let gpxStr = `<?xml version="1.0" encoding="UTF-8"?>
<gpx
  version="1.0"
  creator="GPX comparator"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns="http://www.topografix.com/GPX/1/0"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd">
  <trk>`;
  segments.forEach((seg) => {
    gpxStr += '\n    <trkseg>';
    seg.forEach((point) => {
      gpxStr += `\n      <trkpt lat="${point.lat}" lon="${point.lon}"></trkpt>`;
    });
    gpxStr += '\n    </trkseg>';
  });
  gpxStr += '\n  </trk>\n</gpx>';

  return gpxStr;
};

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
