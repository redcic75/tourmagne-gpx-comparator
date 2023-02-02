const fs = require('fs/promises');
const { XMLParser} = require('fast-xml-parser');
const calculate = require('./calculate');
const generateGpx = require('./generate-gpx');

// ------ USER DATA ------//
// Path to GPX files to read
const refFile = 'ref';
const challFile = 'chall-autre-chemin-2-fois';

// const refFile = 'orleans-loop-trace';
// const challFile = 'orleans-loop-real';

// const refFile = 'Bordeaux-Paris_2022_trace';
// const challFile = 'Bordeaux_Paris_2022_real';

// Params
const options = {
  trigger: 20, // in meters - trigger must be less than tolerance
  tolerance: 100, // in meters
  maxDetour: 20000, // in meters
};

// ------ SCRIPT ------ //
const main = async () => {
  const prefix = './gpx/'
  const refPath = prefix + refFile + '.gpx';
  const challPath = prefix + challFile + '.gpx';

  // Load files -> strings
  const refPromise = fs.readFile(refPath, { encoding: 'utf8' });
  const challPromise = fs.readFile(challPath, { encoding: 'utf8' });
  const [refStr, challStr] = await Promise.all([refPromise, challPromise]);

  // Parse gpx strings -> JS objects
  const parser = new XMLParser({
    ignoreAttributes : false,
    parseAttributeValue: true,
    attributeNamePrefix : '',
  });
  const refGpx = parser.parse(refStr);
  const challGpx = parser.parse(challStr);

  // Create points arrays
  const refPoints = refGpx.gpx.trk.trkseg.trkpt;
  const challPoints = challGpx.gpx.trk.trkseg.trkpt;

  const {
    missedSegmentsOffTolerance,
    refDistance,
    missedDistance,
  } = await calculate(refPoints, challPoints, options);

  // Generate the file containing the missed segments
  generateGpx(missedSegmentsOffTolerance, options);

  // Final display
  console.log('\nAnalysis summary:');
  console.log(`Reference gpx file: ${refFile}`);
  console.log(`Challenger gpx file: ${challFile}`);
  console.log(`Trigger: ${options.trigger} m`);
  console.log(`Tolerance: ${options.tolerance} m`);
  console.log(`Max detour: ${options.maxDetour} m`);
  console.log(`Missed ${Math.round(missedDistance)} meters of the reference path`)
  console.log(`Missed ${Math.round(missedDistance / refDistance * 1000) / 10} % of the reference path`)
}

main();
