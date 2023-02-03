const fs = require('fs/promises');

const generateGpx = async (segments, options) => {
  const {
    trigger,
    tolerance,
    maxDetour,
    refFile,
    challFile,
  } = options;

  // Generate GPX string from segments
  let gpxStr = '<?xml version="1.0" encoding="UTF-8"?><gpx>';
  segments.forEach((seg) => {
    gpxStr += '<trk><trkseg>'
    seg.forEach((point) => {
      gpxStr += `<trkpt lat="${point.lat}" lon="${point.lon}"></trkpt>`
    });
    gpxStr += '</trkseg></trk>'
  });
  gpxStr += '</gpx>';

  // Write a GPX file
  const outputFilePath = `./generated_files/missed-${refFile}-${challFile}-${trigger}-${tolerance}-${maxDetour}.gpx`
  await fs.writeFile(outputFilePath, gpxStr);

  return gpxStr;
}

module.exports = generateGpx;
