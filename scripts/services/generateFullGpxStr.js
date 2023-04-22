const generateTrk = (segments, options) => {
  const {
    name,
    color,
  } = options;

  let gpxTrk = `\n  <trk>
    <name>${name}</name>
    <extensions>
      <gpxx:TrackExtension>
        <gpxx:DisplayColor>${color}</gpxx:DisplayColor>
      </gpxx:TrackExtension>
    </extensions>`;

  segments.forEach((seg) => {
    gpxTrk += '\n    <trkseg>';
    seg.forEach((point) => {
      gpxTrk += `\n      <trkpt lat="${point.lat}" lon="${point.lon}"></trkpt>`;
    });
    gpxTrk += '\n    </trkseg>';
  });
  gpxTrk += '\n  </trk>';

  return gpxTrk;
};

const generateFullGpxStr = (results) => {
  const {
    tracks: {
      ref,
      chall,
      missedSegments,
      worst,
    },
  } = results;

  let gpxStr = `<?xml version="1.0" encoding="UTF-8"?>
<gpx
  version="1.0"
  creator="GPX comparator"
  xmlns="http://www.topografix.com/GPX/1/0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd">`;

  gpxStr += generateTrk(ref, {
    name: 'Référence',
    color: 'Blue',
  });

  gpxStr += generateTrk(chall, {
    name: 'Réalisé',
    color: 'Green',
  });

  gpxStr += generateTrk(missedSegments, {
    name: 'Ecarts',
    color: 'Red',
  });

  gpxStr += generateTrk(worst, {
    name: 'Pire période',
    color: 'White',
  });

  gpxStr += '\n</gpx>';
  return gpxStr;
};

module.exports = generateFullGpxStr;
