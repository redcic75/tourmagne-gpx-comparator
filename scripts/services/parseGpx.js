const { XMLParser } = require('fast-xml-parser');

// Parse gpx string
// -> [{lat, lon, time}]
const parseGpx = (strs) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    attributeNamePrefix: '',
  });

  const trkptsArr = strs.map((str) => {
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
    return trkpts;
  });

  const trkpts = trkptsArr
    .sort((a, b) => new Date(a[0].time.valueOf()) - new Date(b[0].time.valueOf()))
    .flat();

  // Only keep relevant properties (i.e. lat, lon & time)
  const keepLatLonTime = (({ lat, lon, time }) => ({ lat, lon, time }));

  return trkpts.map((trkpt) => keepLatLonTime(trkpt));
};

module.exports = parseGpx;
