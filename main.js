const { XMLParser} = require('fast-xml-parser');
const geolib = require('geolib');

// Path to GPX files to read
const refFile = 'ref';
const challFile = 'chall-autre-chemin-2-fois';

// const refFile = 'orleans-loop-trace';
// const challFile = 'orleans-loop-real';

// const refFile = 'Bordeaux-Paris_2022_trace';
// const challFile = 'Bordeaux_Paris_2022_real';

const prefix = './gpx/'
const refPath = prefix + refFile + '.gpx';
const challPath = prefix + challFile + '.gpx';

// Params
const trigger = 20; // in meters - trigger must be less than tolerance
const tolerance = 100; // in meters
const maxDetour = 20000; // in meters

// Parsers for reference route and challenger track
const options = {
    ignoreAttributes : false,
    parseAttributeValue: true,
    attributeNamePrefix : '',
};
const parser = new XMLParser(options);

// Links with HTML file
const refFileInputEl = document.querySelector('#ref');
const challFileInputEl = document.querySelector('#chall');
const buttonEl = document.querySelector('#calculateBtn');
const progressEl = document.querySelector('#progress');
const missedDistanceEl = document.querySelector('#missedDistance');
const missedPercentEl = document.querySelector('#missedPercent');

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

  // TODO - Write a GPX file
  // const outputFilePath = `./generated_files/missed---${tolerance}-${maxDetour}.gpx`
  // await fs.writeFile(outputFilePath, gpxStr);

  return gpxStr;
}

// Calculate total distance of a track segment (represented by an array of points)
const calculateTotalDistance = (points) => {
  let distance = 0;
  for (let i = 1; i < points.length; i++) {
    distance += geolib.getDistance(points[i-1], points[i]);
  }
  return distance;
}


const calculate = async () => {
  progressEl.innerHTML = 'Comparaison en cours';

  const refPoints = refFileInputEl.points;
  const challPoints = challFileInputEl.points;

  // Initialize the missedSegments array
  // This array will contain segment arrays
  // Each segment array will contain consecutive missed trackpoints
  const missedSegments = [[]];

  let challIndex = 0;

  // Loop through all reference track points
  refIndexLoop:
  for (let refIndex = 0; refIndex < refPoints.length; refIndex++) {
    const refPoint = refPoints[refIndex];

    console.log(Math.floor(refIndex / refPoints.length * 1000) / 10);
    progressEl.setAttribute('value', `${Math.floor(refIndex / refPoints.length * 1000) / 10}`)

    let challDetour = 0;
    let minDist; // minimum distance between current refPoint and chall track;
    challIndexLoop:
    for (let challLocalIndex = challIndex; challLocalIndex < challPoints.length - 1; challLocalIndex++) {
      const dist = geolib.getDistanceFromLine(
        refPoint,
        challPoints[challLocalIndex],
        challPoints[challLocalIndex + 1]
      );
      if (!minDist || dist < minDist) {
        minDist = dist;
      }
      if (dist <= trigger) {
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
    // didn't pass close enough (i.e. d > trigger)
    // from the reference track.
    // In this case, add the missed refPoint to the missedSegments array
    refPoint.index = refIndex;
    refPoint.dist = minDist; // store min distance from reference to challenger track
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

  // Filter out missedSegment where max of minDist is < tolerance
  const missedSegmentsOffTolerance = missedSegments.filter(segment =>
    segment.some(point => point.dist > tolerance)
  );

  // Generate the file containing the missed segments
  generateGpx(missedSegmentsOffTolerance);

  // Calculate and display synthesis
  const refDistance = calculateTotalDistance(refPoints);
  const missedDistance = missedSegmentsOffTolerance.reduce((acc, segment) => acc + calculateTotalDistance(segment), 0);

  // Final display
  console.log('\nAnalysis summary:');
  console.log(`Reference gpx file: ${refFile}`);
  console.log(`Challenger gpx file: ${challFile}`);
  console.log(`Trigger: ${trigger} m`);
  console.log(`Tolerance: ${tolerance} m`);
  console.log(`Max detour: ${maxDetour} m`);
  console.log(`Missed ${Math.round(missedDistance)} meters of the reference path`)
  console.log(`Missed ${Math.round(missedDistance / refDistance * 1000) / 10} % of the reference path`)
  progressEl.innerHTML = 'Comparaison terminée';
  missedDistanceEl.innerHTML = `Missed distance of the reference path: ${Math.round(missedDistance)} m`;
  missedPercentEl.innerHTML = `Missed % of the reference path: ${Math.round(missedDistance / refDistance * 1000) / 10} %`
}

// load files
const loadFile = async (evt) => {
  const currentTarget = evt.currentTarget;
  const file = evt.currentTarget.files[0];
  const str = await file.text();
  const gpx = parser.parse(str);
  currentTarget.points = gpx.gpx.trk.trkseg.trkpt;
}

// Event listeners
refFileInputEl.addEventListener('change', loadFile);
challFileInputEl.addEventListener('change', loadFile);
buttonEl.addEventListener('click', calculate);
