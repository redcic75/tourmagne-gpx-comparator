/* eslint-disable no-console */
const fs = require('fs/promises');
const path = require('path');

const parseGpx = require('./services/parseGpx');
const compareGpx = require('./services/compareGpx');
const generateGpxStr = require('./services/generateGpxStr');

// ------ USER DATA ------//
// Path to GPX files to read
// const refFile = 'ref';
// const challFile = 'chall-autre-chemin-2-fois';

// const refFile = 'orleans-loop-trace';
// const challFile = 'orleans-loop-real';

const refFile = 'Bordeaux-Paris_2022_trace';
const challFile = 'Bordeaux_Paris_2022_real';

// Params
const options = {
  duration: 1, // in hours
  trigger: 20, // in meters - trigger must be less than tolerance
  tolerance: 100, // in meters
  maxDetour: 20000, // in meters
};

// ------ SCRIPT ------ //
const main = async () => {
  const prefix = path.resolve(__dirname, '../data/gpx/');
  const refPath = `${prefix}/${refFile}.gpx`;
  const challPath = `${prefix}/${challFile}.gpx`;

  // Load files -> strings
  const refPromise = fs.readFile(refPath, { encoding: 'utf8' });
  const challPromise = fs.readFile(challPath, { encoding: 'utf8' });
  const [refStr, challStr] = await Promise.all([refPromise, challPromise]);

  // Parse strings to JS objects
  const refPoints = parseGpx(refStr);
  const challPoints = parseGpx(challStr);

  const {
    missedSegmentsOffTolerance,
    refDistance,
    missedDistance,
    perf,
    pt,
  } = await compareGpx(refPoints, challPoints, options);

  // Generate the file containing the missed segments
  const gpxStr = await generateGpxStr(missedSegmentsOffTolerance);

  // Write GPX file on disk
  const outputFilePath = path.resolve(__dirname, `../data/generated_files/missed-${refFile}-${challFile}-${options.trigger}-${options.tolerance}-${options.maxDetour}.gpx`);
  await fs.writeFile(outputFilePath, gpxStr);

  // Final display
  console.log('');
  console.log('Analysis summary:');
  console.log('-----------------');
  console.log(`Reference gpx file: ${refFile}`);
  console.log(`Challenger gpx file: ${challFile}`);
  console.log(`Duration: ${options.duration} h`);
  console.log(`Trigger: ${options.trigger} m`);
  console.log(`Tolerance: ${options.tolerance} m`);
  console.log(`Max detour: ${options.maxDetour} m`);
  console.log('');
  console.log(`Missed distance of the reference path in m: ${Math.round(missedDistance)} m`);
  console.log(`Missed distance of the reference path in %: ${Math.round((missedDistance / refDistance) * 1000) / 10} %`);
  console.log(`Worst ${options.duration} h:`);
  console.log(`  - Started after ${Math.round(pt[perf.startRefIndex].time / (3600 * 10)) / 100} h at km ${pt[perf.startRefIndex].cumulatedDistance / 1000}`);
  console.log(`  - Mean speed during this period: ${Math.round(perf.speed) / 1000} km/h`);
};

main();
