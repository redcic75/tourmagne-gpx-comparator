// const fs = require('fs/promises');

const generateGpx = async (segments, options) => {
  const {
    trigger,
    tolerance,
    maxDetour,
  } = options;

  // Generate GPX string from segments
  let gpxStr = '<?xml version="1.0" encoding="UTF-8"?><gpx><trk>';
  segments.forEach((seg) => {
    gpxStr += '<trkseg>'
    seg.forEach((point) => {
      gpxStr += `<trkpt lat="${point.lat}" lon="${point.lon}"></trkpt>`
    });
    gpxStr += '</trkseg>'
  });
  gpxStr += '</trk></gpx>';

  // Write a GPX file
  // const outputFilePath = `./generated_files/missed---${trigger}-${tolerance}-${maxDetour}.gpx`
  // await fs.writeFile(outputFilePath, gpxStr);

  return gpxStr;
}

module.exports = generateGpx;
