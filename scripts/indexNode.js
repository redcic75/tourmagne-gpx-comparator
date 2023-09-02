/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');

const parseGpx = require('./workers/parseGpx');
const compareTracks = require('./workers/compareTracks');
const getGpxStrs = require('./services/getGpxStrs');
const logComparisonResults = require('./services/logComparisonResults');
const writeAllToGpxFile = require('./services/writeAllToGpxFile');

function getAllGpxFiles(directoryPath) {
  const files = fs.readdirSync(directoryPath);

  const gpxFiles = files
    .filter((file) => path.extname(file).toLowerCase() === '.gpx')
    .map((file) => path.basename(file, '.gpx'));

  return gpxFiles;
}

// Launches console script
const main = async (refPaths, challPaths, options) => {
  console.time('gpxComparator');

  const refGpxStrs = await getGpxStrs(refPaths);
  const challGpxStrs = await getGpxStrs(challPaths);

  // Parse GPX strings to JS objects
  let refPoints;
  let challPoints;
  try {
    console.log('Parsing reference GPX file...');
    refPoints = parseGpx(refGpxStrs).flat();

    console.log('Parsing challenger GPX files...');
    challPoints = parseGpx(challGpxStrs).flat();
  } catch (err) {
    console.log(`ERREUR: ${err.message}`);
  }

  let results;
  try {
    console.log('Comparing reference and challenger tracks...');
    results = compareTracks(
      refPoints,
      challPoints,
      options,
    );
  } catch (err) {
    console.log(`ERREUR: ${err.message}`);
    return;
  }

  await writeAllToGpxFile(results);

  logComparisonResults({
    refPaths,
    challPaths,
    options,
  }, results);
  console.timeEnd('gpxComparator');
};

// ------ USER DATA ------//
const options = {
  rollingDuration: 24, // in hours
  trigger: 8, // in meters - trigger must be less than tolerance
  tolerance: 80, // in meters
  maxDetour: 20000, // in meters
  maxSegLength: 200, // in meters
};

const refFiles = getAllGpxFiles('data/inputs/reference_track');
const challFiles = getAllGpxFiles('data/inputs/challenger_tracks');

const prefix = path.resolve(__dirname, '../data/inputs');
const refPaths = refFiles.map((refFile) => `${prefix}/reference_track/${refFile}.gpx`);
const challPaths = challFiles.map((challFile) => `${prefix}/challenger_tracks/${challFile}.gpx`);

// Launches main
main(refPaths, challPaths, options);
