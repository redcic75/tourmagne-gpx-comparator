/* eslint-disable no-console */

// Independant script (not used by the main program)
// Used to extract only one data point every minute
// Objective : analyse the impact of having only one datapoint per DELTA_TIME_MS on the
// % and performance indicator

const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

const getGpxStrs = require('../scripts/services/getGpxStrs');
const parseGpx = require('../scripts/workers/parseGpx');

const OUTPUT_FILE_PATH = '../data/output/onePerMinute.gpx';
const DELTA_TIME_MS = 60 * 1000; // 1 minute in milliseconds

const getAllGpxFiles = (directoryPath) => {
  const files = fs.readdirSync(directoryPath);

  const gpxFiles = files
    .filter((file) => path.extname(file).toLowerCase() === '.gpx')
    .map((file) => path.basename(file, '.gpx'));

  return gpxFiles;
};

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

const main = async (challPaths) => {
  const challGpxStrs = await getGpxStrs(challPaths);
  const challPoints = parseGpx(challGpxStrs).flat();

  const extractedChallPoints = [challPoints[0]];
  let lastPointTime = new Date(extractedChallPoints[0].time);

  challPoints.slice(1).forEach((point) => {
    const currentPointTime = new Date(point.time);
    const deltaTimeMs = currentPointTime - lastPointTime;
    if (deltaTimeMs > DELTA_TIME_MS) {
      extractedChallPoints.push(point);

      lastPointTime = new Date(extractedChallPoints.at(-1).time);
    }
  });

  const gpxStr = writeGpxStr(extractedChallPoints);

  // Write GPX file on disk
  const outputFilePath = path.resolve(__dirname, OUTPUT_FILE_PATH);

  await fsp.writeFile(outputFilePath, gpxStr);
};

const challFiles = getAllGpxFiles('data/inputs/challenger_tracks');

const prefix = path.resolve(__dirname, '../data/inputs');
const challPaths = challFiles.map((challFile) => `${prefix}/challenger_tracks/${challFile}.gpx`);

main(challPaths);
