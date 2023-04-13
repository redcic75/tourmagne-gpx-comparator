const { XMLParser } = require('fast-xml-parser');

// Parse gpx string
// -> [{lat, lon, time}]
const parseGpx = (str) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    attributeNamePrefix: '',
  });

  const gpx = parser.parse(str);

  // Create points array
  const trkseg = gpx?.gpx?.trk?.trkseg;

  // Merge <trkseg> if there are many in stringified gpx file
  let trkpts;
  if (Array.isArray(trkseg)) {
    trkpts = [];
    trkseg.forEach((seg) => {
      trkpts.push(...seg.trkpt);
    });
  } else {
    trkpts = trkseg?.trkpt;
  }

  // Only keep relevant properties (i.e. lat, lon & time)
  const keepLatLonTime = (({ lat, lon, time }) => ({ lat, lon, time }));

  return trkpts.map((trkpt) => keepLatLonTime(trkpt));
};

module.exports = parseGpx;
