const fs = require('fs/promises')
const gpxParser = require('gpxparser');
const geolib = require('geolib');

// Path to GPX files to read
const refPath = './gpx/ref.gpx';
// const challPath = './gpx/chall-detour.gpx';
// const challPath = './gpx/chall-autre-chemin.gpx';
const challPath = './gpx/chall-autre-chemin-2-fois.gpx';

// Params
const tolerance = 20; // in meters

// Parsers for reference route and challenger track
const refGpx = new gpxParser();
const challGpx = new gpxParser();

async function main() {
  const refPromise = fs.readFile(refPath, { encoding: 'utf8' });
  const challPromise = fs.readFile(challPath, { encoding: 'utf8' });
  const [refFile, challFile] = await Promise.all([refPromise, challPromise]);

  refGpx.parse(refFile);
  challGpx.parse(challFile);

  // TODO - Handle GPX with multiple tracks or multiple track segments
  const refPoints = refGpx.tracks[0].points;
  const challPoints = challGpx.tracks[0].points;

  const refPointsMissed = [];
  refPoints.forEach((point, index) => {
    const nearest = geolib.findNearest(point, challPoints);
    const dist = geolib.getDistance(point, nearest);
    if (dist > tolerance) {
      point.index = index;
      refPointsMissed.push(point);
    }
  });

  console.log(refPointsMissed);
}

main();

/**
 * Syntax
const totalDistance = gpx.tracks[0].distance.total;
gpx.tracks[0].points[2];
const dist = geolib.getDistance(gpx.tracks[0].points[2], gpx.tracks[0].points[5]);
 */
