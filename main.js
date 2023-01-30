const fs = require('fs/promises')
const { XMLParser} = require('fast-xml-parser');
const geolib = require('geolib');

// Path to GPX files to read
// const refFile = 'ref';
// const challFile = 'chall-autre-chemin-2-fois';

const refFile = 'orleans-loop-trace';
const challFile = 'orleans-loop-real';

// const refFile = 'Bordeaux-Paris_2022_trace';
// const challFile = 'Bordeaux_Paris_2022_real';

const prefix = './gpx/'
const refPath = prefix + refFile + '.gpx';
const challPath = prefix + challFile + '.gpx';

// Params
const tolerance = 100; // in meters
const maxDetour = 20000; // in meters

// Parsers for reference route and challenger track
const options = {
    ignoreAttributes : false,
    parseAttributeValue: true,
    attributeNamePrefix : '',
};
const parser = new XMLParser(options);

const generateGpx = async (segments) => {
  // Generate GPX string from segments
  let gpxStr = '<xml><gpx>';
  segments.forEach((seg) => {
    gpxStr += '<trk><trkseg>'
    seg.forEach((point) => {
      gpxStr += `<trkpt lat="${point.lat}" lon="${point.lon}"></trkpt>`
    });
    gpxStr += '</trkseg></trk>'
  });
  gpxStr += '</gpx></xml>';

  // Write a GPX file
  const outputFilePath = `./generated_files/missed-${refFile}-${challFile}-${tolerance}-${maxDetour}.gpx`
  await fs.writeFile(outputFilePath, gpxStr);
}

// Calculate total distance of a track segment (represented by an array of points)
const calculateTotalDistance = (points) => {
  let distance = 0;
  for (let i = 1; i < points.length; i++) {
    distance += geolib.getDistance(points[i-1], points[i]);
  }
  return distance;
}

const main = async () => {
  // Load files -> strings
  const refPromise = fs.readFile(refPath, { encoding: 'utf8' });
  const challPromise = fs.readFile(challPath, { encoding: 'utf8' });
  const [refStr, challStr] = await Promise.all([refPromise, challPromise]);

  // Parse gpx strings -> JS objects
  const refGpx = parser.parse(refStr);
  const challGpx = parser.parse(challStr);

  // Create points arrays
  const refPoints = refGpx.gpx.trk.trkseg.trkpt;
  const challPoints = challGpx.gpx.trk.trkseg.trkpt;

  // Initialize the missedSegments array
  // This array will contain segment arrays
  // Each segment array will contain consecutive missed trackpoints
  const missedSegments = [[]];

  let challIndex = 0;

  // Loop through all reference track points
  refIndexLoop:
  for (let refIndex = 0; refIndex < refPoints.length; refIndex++) {
    const refPoint = refPoints[refIndex];

    console.log(`${Math.floor(refIndex / refPoints.length * 1000) / 10} %`);

    challDetour = 0;
    challIndexLoop:
    for (let challLocalIndex = challIndex; challLocalIndex < challPoints.length - 1; challLocalIndex++) {
      const dist = geolib.getDistanceFromLine(
        refPoint,
        challPoints[challLocalIndex],
        challPoints[challLocalIndex + 1]
      );
      if (dist <= tolerance) {
        challIndex = challLocalIndex;
        continue refIndexLoop;
      }
      challDetour += geolib.getDistance(challPoints[challLocalIndex], challPoints[challLocalIndex + 1]);
      // Only look for waypoint in challFile in the next maxDetour meters from the last waypoint
      if (challDetour > maxDetour) {
        break challIndexLoop;
      }
    }

    // Passing here only when challenger track
    // didn't pass close enough (i.e. d < tolerance)
    // from the reference track.
    // In this case, add the missed refPoint to the missedSegments array
    refPoint.index = refIndex;
    let lastMissedSegment = missedSegments[missedSegments.length - 1];

    // Append to lastMissedSegment only if current missing trackpoint from reference
    // immediatly follows the last one added.
    // If not create a new segment in missedSegments.
    if (lastMissedSegment.length === 0 ||
        lastMissedSegment[lastMissedSegment.length - 1].index === refIndex - 1) {
      lastMissedSegment.push(refPoint);
    } else {
      missedSegments.push([refPoint]);
    }
  };

  // Generate the file containing the missed segments
  generateGpx(missedSegments);

  // Calculate and display synthesis
  const refDistance = calculateTotalDistance(refPoints);
  const missedDistance = missedSegments.reduce((acc, segment) => acc + calculateTotalDistance(segment), 0);

  // Final display
  console.log('\nAnalysis summary:');
  console.log(`Reference gpx file: ${refFile}`);
  console.log(`Challenger gpx file: ${challFile}`);
  console.log(`Tolerance: ${tolerance} m`);
  console.log(`Max detour: ${maxDetour} m`);
  console.log(`Missed ${Math.round(missedDistance)} meters of the reference path`)
  console.log(`Missed ${Math.round(missedDistance / refDistance * 1000) / 10} % of the reference path`)
}

main();
