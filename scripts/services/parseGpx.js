const { XMLParser } = require('fast-xml-parser');

const parseGpx = (str) => {
  // Parse gpx string -> JS object
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    attributeNamePrefix: '',
  });

  const gpx = parser.parse(str);

  // Create points array
  const trkpts = gpx?.gpx?.trk?.trkseg?.trkpt;
  // Only keep relevant properties (i.e. lat, lon & time)
  const keepLatLonTime = (({ lat, lon, time }) => ({ lat, lon, time }));
  const result = trkpts.map((trkpt) => keepLatLonTime(trkpt));
  return result;
};

module.exports = parseGpx;
