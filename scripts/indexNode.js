const path = require('path');

const compareGpx = require('./services/compareGpx');
const getGpxStr = require('./services/getGpxStr');
const logComparisonResults = require('./services/logComparisonResults');
const writeMissedSegmentsToGpxFile = require('./services/writeMissedSegmentsToGpxFile');

// Launches console script
const main = async (userInputs) => {
  const {
    refPath,
    challPath,
  } = userInputs;

  const [refGpxStr, challGpxStr] = await getGpxStr(refPath, challPath);

  const inputs = {
    ...userInputs,
    refGpxStr,
    challGpxStr,
  };

  const results = await compareGpx(inputs);

  writeMissedSegmentsToGpxFile(results);

  logComparisonResults(results);
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

const userInputs = {
  refPath,
  challPath,
  options,
};

// Launches main
main(userInputs);
