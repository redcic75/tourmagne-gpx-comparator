const path = require('path');

const parseGpx = require('./services/parseGpx');
const compareTracks = require('./services/compareTracks');
const getGpxStrs = require('./services/getGpxStrs');
const logComparisonResults = require('./services/logComparisonResults');
const writeAllToGpxFile = require('./services/writeAllToGpxFile');

// Launches console script
const main = async (refPaths, challPaths, options) => {
  console.time('gpxComparator');

  const refGpxStrs = await getGpxStrs(refPaths);
  const challGpxStrs = await getGpxStrs(challPaths);

  // Parse GPX strings to JS objects
  let refPoints;
  let challPoints;
  try {
    refPoints = parseGpx(refGpxStrs).flat();
    challPoints = parseGpx(challGpxStrs).flat();
  } catch (err) {
    console.log(`ERREUR: ${err.message}`);
  }

  let results;
  try {
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
// Path to GPX files to read

// const refFiles = ['Bordeaux_Paris_2022_real'];
// const refFiles = ['Bordeaux_Paris_2022_trace'];
// const challFiles = ['Bordeaux_Paris_2022_real'];

// const refFiles = ['orleans-loop-trace'];
const refFiles = ['challenger_data/traces/monotracev20230630'];
// const challFiles = [
//   'orleans-loop-real-seg-1',
//   'orleans-loop-real-seg-3',
//   'orleans-loop-real-seg-2'];
// const challFiles = ['orleans-loop-real-3-trkseg'];
const challFiles = [
  'challenger_data/challengers/Brabant/Morning_Ride 2',
  'challenger_data/challengers/Brabant/Morning_Ride 3',
  'challenger_data/challengers/Brabant/Morning_Ride 4',
  'challenger_data/challengers/Brabant/Morning_Ride 5',
  'challenger_data/challengers/Brabant/Morning_Ride 6',
  'challenger_data/challengers/Brabant/Morning_Ride 7',
  'challenger_data/challengers/Brabant/Morning_Ride 8',
  'challenger_data/challengers/Brabant/Morning_Ride',
  'challenger_data/challengers/Brabant/Night_Ride',
];

// const refFiles = ['tourmagne-ref'];
// const challFiles = ['tourmagne-francois'];

// Params
const options = {
  rollingDuration: 24, // in hours
  trigger: 8, // in meters - trigger must be less than tolerance
  tolerance: 80, // in meters
  maxDetour: 20000, // in meters
  maxSegLength: 200, // in meters
};

const prefix = path.resolve(__dirname, '../data/gpx/');
const refPaths = refFiles.map((refFile) => `${prefix}/${refFile}.gpx`);
const challPaths = challFiles.map((challFile) => `${prefix}/${challFile}.gpx`);

// Launches main
main(refPaths, challPaths, options);
