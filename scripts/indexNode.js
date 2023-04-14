const path = require('path');

const parseGpx = require('./services/parseGpx');
const compareTracks = require('./services/compareTracks');
const getGpxStrs = require('./services/getGpxStrs');
const logComparisonResults = require('./services/logComparisonResults');
const writeMissedSegmentsToGpxFile = require('./services/writeMissedSegmentsToGpxFile');

// Launches console script
const main = async (refPaths, challPaths, options) => {
  const refGpxStrs = await getGpxStrs(refPaths);
  const challGpxStrs = await getGpxStrs(challPaths);

  // Parse GPX strings to JS objects
  const refPoints = parseGpx(refGpxStrs).flat();
  const challPoints = parseGpx(challGpxStrs).flat();

  const results = await compareTracks(
    refPoints,
    challPoints,
    options,
  );

  const inputParams = {
    refPaths,
    challPaths,
    options,
  };

  await writeMissedSegmentsToGpxFile(inputParams, results);

  logComparisonResults(inputParams, results);
};

// ------ USER DATA ------//
// Path to GPX files to read

// const refFiles = ['Bordeaux_Paris_2022_real'];
// const refFiles = ['Bordeaux_Paris_2022_trace'];
// const challFiles = ['Bordeaux_Paris_2022_real'];

const refFiles = ['orleans-loop-trace'];
const challFiles = ['orleans-loop-real-seg-1', 'orleans-loop-real-seg-3', 'orleans-loop-real-seg-2'];
// const challFiles = ['orleans-loop-real-3-trkseg'];

// Params
const options = {
  rollingDuration: 1, // in hours
  trigger: 20, // in meters - trigger must be less than tolerance
  tolerance: 100, // in meters
  maxDetour: 20000, // in meters
};

const prefix = path.resolve(__dirname, '../data/gpx/');
const refPaths = refFiles.map((refFile) => `${prefix}/${refFile}.gpx`);
const challPaths = challFiles.map((challFile) => `${prefix}/${challFile}.gpx`);

// Launches main
main(refPaths, challPaths, options);
