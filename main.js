const fs = require('fs/promises')
const gpxParser = require('gpxparser');
const geolib = require('geolib');

// Path to GPX files to read
const refPath = './gpx/ref.gpx';
const challPath = './gpx/chall-autre-chemin-2-fois.gpx';

// Params
const tolerance = 20; // in meters

// Parsers for reference route and challenger track
const refGpx = new gpxParser();
const challGpx = new gpxParser();;

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
  await fs.writeFile('./generated_files/missed.gpx', gpxStr);

  // Generates a missedGpx object and returns it
  const missedGpx = new gpxParser();
  missedGpx.parse(gpxStr);
  return missedGpx;
}

const main = async () => {
  // Load files
  const refPromise = fs.readFile(refPath, { encoding: 'utf8' });
  const challPromise = fs.readFile(challPath, { encoding: 'utf8' });
  const [refStr, challStr] = await Promise.all([refPromise, challPromise]);

  // Create parsers
  refGpx.parse(refStr);
  challGpx.parse(challStr);

  // Create points arrays
  // TODO - Handle GPX with multiple tracks or multiple track segments
  const refPoints = refGpx.tracks[0].points;
  const challPoints = challGpx.tracks[0].points;

  // Initialize the missedSegments array
  // This array will contain segment arrays
  // Each segment array will contain consecutive missed trackpoints
  const missedSegments = [[]];

  let challIndex = 0;

  // Loop through all reference track points
  refIndexLoop:
  for (let refIndex = 0; refIndex < refPoints.length; refIndex++) {
    const refPoint = refPoints[refIndex];

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
  missedGpx = await generateGpx(missedSegments)

  // Calculate and display synthesis
  const missedDistance = missedGpx.tracks.reduce((acc, track) => acc + track.distance.total, 0);
  const missedPercent = missedDistance / refGpx.tracks[0].distance.total * 100
  console.log(`Missed ${Math.round(missedDistance)} meters of the reference path`)
  console.log(`Missed ${Math.round(missedPercent * 10) / 10} % of the reference path`)
}

main();
