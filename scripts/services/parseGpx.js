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
  return gpx?.gpx?.trk?.trkseg?.trkpt;
};

module.exports = parseGpx;
