const { XMLParser } = require('fast-xml-parser');
const fs = require('fs/promises');

const filePath = '/home/redcic75/code/redcic75/tourmagne-gpx-comparator/data/gpx/evaluate-challenger/challenger/VE06.gpx';
const outputFilePath = '/home/redcic75/code/redcic75/tourmagne-gpx-comparator/data/gpx/evaluate-challenger/challenger/VE06Fixed.gpx';

const writeGpxStr = (trkseg) => {
  let gpxStr = `<?xml version="1.0" encoding="UTF-8"?>
<gpx
  version="1.0"
  creator="GPX comparator"
  xmlns="http://www.topografix.com/GPX/1/0"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/0 http://www.topografix.com/GPX/1/0/gpx.xsd">
  <trk>
    <trkseg>`;

  trkseg.forEach((point) => {
    gpxStr += `\n      <trkpt lat="${point.lat}" lon="${point.lon}" time="${point.time}"></trkpt>`;
  });

  gpxStr += '\n    </trkseg>\n  </trk>';

  return gpxStr;
};

const main = async () => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    attributeNamePrefix: '',
  });

  const str = await fs.readFile(filePath, { encoding: 'utf8' });
  const gpx = parser.parse(str);

  gpx.gpx.trk.trkseg.trkpt = gpx.gpx.trk.trkseg.trkpt.map((pt) => {
    const originalDate = new Date(pt.time);
    originalDate.setHours(originalDate.getHours() + 12);
    const updatedDateString = originalDate.toISOString();

    return {
      ...pt,
      time: updatedDateString,
    };
  });

  const gpxStr = writeGpxStr(gpx.gpx.trk.trkseg.trkpt);

  await fs.writeFile(outputFilePath, gpxStr);
};

main();
