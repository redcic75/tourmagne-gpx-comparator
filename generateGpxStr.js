const generateGpxStr = async (segments, options) => {
  const {
    trigger,
    tolerance,
    maxDetour,
  } = options;

  // Generate GPX string from segments
  let gpxStr = `<?xml version="1.0" encoding="UTF-8"?>
<gpx
  version="1.0"
  creator="GPX comparator"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns="http://www.topografix.com/GPX/1/0"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd">
  <trk>`;
  segments.forEach((seg) => {
    gpxStr += '\n    <trkseg>'
    seg.forEach((point) => {
      gpxStr += `\n      <trkpt lat="${point.lat}" lon="${point.lon}"></trkpt>`
    });
    gpxStr += '\n    </trkseg>'
  });
  gpxStr += '\n  </trk>\n</gpx>';

  return gpxStr;
}

module.exports = generateGpxStr;
