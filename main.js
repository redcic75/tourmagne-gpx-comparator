const fs = require('fs/promises')
const gpxParser = require('gpxparser');
const geolib = require('geolib');

// Path to GPX files to read
const refPath = './gpx/ref.gpx';
// const challPath = './gpx/chall-detour.gpx';
// const challPath = './gpx/chall-start-after.gpx';
// const challPath = './gpx/chall-start-before.gpx';
// const challPath = './gpx/chall-autre-chemin.gpx';
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
  const refPromise = fs.readFile(refPath, { encoding: 'utf8' });
  const challPromise = fs.readFile(challPath, { encoding: 'utf8' });
  const [refStr, challStr] = await Promise.all([refPromise, challPromise]);

  refGpx.parse(refStr);
  challGpx.parse(challStr);

  // TODO - Handle GPX with multiple tracks or multiple track segments
  const refPoints = refGpx.tracks[0].points;
  const challPoints = challGpx.tracks[0].points;

  const missedSegments = [];
  refPoints.forEach((point, index) => {
    const nearest = geolib.findNearest(point, challPoints);
    const dist = geolib.getDistance(point, nearest);

    if (dist > tolerance) {
      // Update point with index
      point.index = index;

      if (missedSegments.length === 0) {
        missedSegments.push([]);
      }

      let lastMissedSegment = missedSegments[missedSegments.length - 1];

      if (lastMissedSegment.length === 0 ||
          lastMissedSegment[lastMissedSegment.length - 1].index === index - 1) {
        lastMissedSegment.push(point);
      } else {
        missedSegments.push([point]);
      }
    }
  });

  missedGpx = await generateGpx(missedSegments)
  const missedDistance = missedGpx.tracks.reduce((acc, track) => acc + track.distance.total, 0);
  console.log(missedDistance);
}

main();
