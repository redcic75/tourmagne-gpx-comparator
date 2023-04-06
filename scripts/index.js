/* eslint-disable no-console */
const path = require('path');
const fs = require('fs/promises');

const GpxComparator = require('./services/GpxComparator');

// Loads files -> gpxStrings
const loadGpxFiles = async (refPath, challPath) => {
  const refPromise = fs.readFile(refPath, { encoding: 'utf8' });
  const challPromise = fs.readFile(challPath, { encoding: 'utf8' });
  return Promise.all([refPromise, challPromise]);
};

// Logs comparator analysis
const display = (comparator) => {
  const displayString = `

  Analysis summary:
  -----------------
  Reference gpx file: ${comparator.refFilepath}
  Challenger gpx file: ${comparator.challFilepath}
  Fake perf: ${comparator.perf}
  `;

  console.log(displayString);
};

// Launches console script
const main = async (refPath, challPath, options) => {
  const [refGpxStr, challGpxStr] = await loadGpxFiles(refPath, challPath);

  const ref = {
    filepath: refPath,
    gpxStr: refGpxStr,
  };

  const chall = {
    filepath: challPath,
    gpxStr: challGpxStr,
  };

  const myComparator = new GpxComparator(ref, chall, options);

  myComparator.compare();

  display(myComparator);
};

// ------ USER DATA ------//
// Path to GPX files to read
// const refFile = 'ref';
// const challFile = 'chall-autre-chemin-2-fois';

const refFile = 'orleans-loop-trace';
const challFile = 'orleans-loop-real';

// const refFile = 'Bordeaux-Paris_2022_trace';
// const challFile = 'Bordeaux_Paris_2022_real';

// Params
const options = {
  duration: 1, // in hours
  trigger: 20, // in meters - trigger must be less than tolerance
  tolerance: 100, // in meters
  maxDetour: 20000, // in meters
};

const prefix = path.resolve(__dirname, '../data/gpx/');
const refPath = `${prefix}/${refFile}.gpx`;
const challPath = `${prefix}/${challFile}.gpx`;

// Launches main
main(refPath, challPath, options);
