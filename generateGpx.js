const fs = require('fs/promises');

const generateGpx = async (segments, options) => {
  const {
    trigger,
    tolerance,
    maxDetour,
  } = options;

  // Generate GPX string from segments
  let gpxStr = '<xml><gpx>';
  segments.forEach((seg) => {
    gpxStr += '<trk><trkseg>'
    seg.forEach((point) => {
      gpxStr += `<trkpt lat="${point.lat}" lon="${point.lon}"></trkpt>`
    });
    gpxStr += '</trkseg></trk>'
  });
  gpxStr += '</gpx></xml>';

  // Write a GPX file
  const outputFilePath = `./generated_files/missed---${tolerance}-${maxDetour}.gpx`
  await fs.writeFile(outputFilePath, gpxStr);

  return gpxStr;
}

module.exports = generateGpx;
