const path = require('path');

const parseGpx = require('./services/parseGpx');
const compareTracks = require('./services/compareTracks');
const getGpxStr = require('./services/getGpxStr');
const logComparisonResults = require('./services/logComparisonResults');
const writeMissedSegmentsToGpxFile = require('./services/writeMissedSegmentsToGpxFile');

// Launches console script
const main = async (refPath, challPath, options) => {
  const [refGpxStr, challGpxStr] = await getGpxStr(refPath, challPath);

  // Parse GPX strings to JS objects
  const refPoints = parseGpx(refGpxStr);
  const challPoints = parseGpx(challGpxStr);

  const results = await compareTracks(
    refPoints,
    challPoints,
    options,
  );

  const inputParams = {
    refPath,
    challPath,
    options,
  };

  await writeMissedSegmentsToGpxFile(inputParams, results);

  logComparisonResults(inputParams, results);
};

// ------ USER DATA ------//
// Path to GPX files to read
// const refFile = 'ref';
// const challFile = 'chall-autre-chemin-2-fois';

// const refFile = 'Bordeaux_Paris_2022_real';
const refFile = 'Bordeaux_Paris_2022_trace';
const challFile = 'Bordeaux_Paris_2022_real';

// const refFile = 'orleans-loop-trace';
// const refFile = 'orleans-loop-real';
// const challFile = 'orleans-loop-real';

// Params
const options = {
  rollingDuration: 1, // in hours
  trigger: 20, // in meters - trigger must be less than tolerance
  tolerance: 100, // in meters
  maxDetour: 20000, // in meters
};

const prefix = path.resolve(__dirname, '../data/gpx/');
const refPath = `${prefix}/${refFile}.gpx`;
const challPath = `${prefix}/${challFile}.gpx`;

// Launches main
main(refPath, challPath, options);
