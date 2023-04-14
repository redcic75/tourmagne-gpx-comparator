const { XMLParser } = require('fast-xml-parser');

// Parse gpx string
// -> [{lat, lon, time}]
const parseGpx = (strs) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    attributeNamePrefix: '',
  });

  // trkptsArr is an array with 3 levels
  // 1st level represents the file
  // 2nd level reprensents <trkseg>
  // 3rd level represent <trkpt>
  const trkptsArr = strs.map((str) => {
    const gpx = parser.parse(str);
    const trksegs = gpx?.gpx?.trk?.trkseg;

    // Deal with case with multiple <trkseg> in stringified gpx file
    if (Array.isArray(trksegs)) {
      return trksegs.map((trkseg) => trkseg.trkpt);
    }
    return [trksegs?.trkpt];
  });

  trkptsArr.sort((a, b) => new Date(a[0][0].time.valueOf()) - new Date(b[0][0].time.valueOf()));

  // trkptsLines is an array with 2 levels
  // 1st level represents the lines to display (each line could be a file or a <trkseg>)
  // 2nd level reprensents <trkpt>
  const trkptsLines = trkptsArr.flat();

  // Only keep relevant properties (i.e. lat, lon & time)
  const keepLatLonTime = (({ lat, lon, time }) => ({ lat, lon, time }));

  return trkptsLines.map((line) => line.map((trkpt) => keepLatLonTime(trkpt)));
};

module.exports = parseGpx;
