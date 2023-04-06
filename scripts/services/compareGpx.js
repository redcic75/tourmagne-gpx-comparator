const geolib = require('geolib');
const { XMLParser } = require('fast-xml-parser');

// Calculate challenger passage time at each ref point
// -> [{latRef, lonRef, timeChall, closestDist}]
// * latRef: ref point latitude
// * lonRef: ref point longitude
// * timeChall: time when challenger passed the closest to ref point
// * closestDist: distance between ref point & challenger
//   when challenger was the closest (before maxDetour)
const calculateClosest = () => {
  // TODO
  const result = [];
  return result;
};

// Calculate ref points the challenger missed
// -> [{latRef, lonRef, timeChall, missedSegmentNb}]
// * missedSegmentNb: undefined if ref point reached by the challenger
//   Integer representing the number of the missed segment starting at 0
const calculateMissed = () => {
  // TODO
  const result = [];
  return result;
};

// Calculate rolling duration distances (Tourmagne KPI)
// -> [{rollingDurationDistance, rollingDurationEndIndex}]
// * rollingDurationDistance: distance travelled by challenger during the next rolling duration
//   null for ref points of the last rollingDuration
// * rollingDurationEndIndex: last index of refPoints included in rollingDurationDistance
//   null for ref points of the last rollingDuration
const calculateRollingDurationDistances = () => {
  // TODO
  const result = [];
  return result;
};

// Calculate elapsed challenger time & cumulated distance (without missed segments)
// -> [{elapsedChallTime, cumulatedDistance}]
// * elapsedChallTime: time elapsed since challenger passed by its 1st ref point
//   null if ref point missed
// * cumulatedDistance: cumulated distance on ref track excluding segments missed by challenger
const calculateTimeDistanceTable = () => {
  // TODO
  const result = [];
  return result;
};

// Calculate total distance of a track segment (represented by an array of points)
const calculateTotalDistance = (points) => {
  let distance = 0;
  for (let i = 1; i < points.length; i += 1) {
    distance += geolib.getDistance(points[i - 1], points[i]);
  }
  return distance;
};

// Generate missed segments
// -> [[{latRef, lonRef}]]
// * Wrapping array is an array of segments
// * Nested arrays are missed segments
const generateMissedSegments = () => {
  // TODO
  const result = [];
  return result;
};

// Parse gpx string
// -> [{lat, lon, time}]
const parseGpx = (str) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    attributeNamePrefix: '',
  });

  const gpx = parser.parse(str);

  // Create points array
  const trkpts = gpx?.gpx?.trk?.trkseg?.trkpt;

  // Only keep relevant properties (i.e. lat, lon & time)
  const keepLatLonTime = (({ lat, lon, time }) => ({ lat, lon, time }));

  return trkpts.map((trkpt) => keepLatLonTime(trkpt));
};

// Calculate accuracy of the challenger following ref track
const calculateAccuracy = (refPoints, missedSegments) => {
  const refDistance = calculateTotalDistance(refPoints);
  const missedDistance = calculateTotalDistance(missedSegments);
  const onTrackRatio = 1 - (missedDistance / refDistance);

  return {
    refDistance,
    missedDistance,
    onTrackRatio,
  };
};

// Calculate Tourmagne Kpis
const calculateKpis = (refPointsMissed) => {
  const timeDistanceTable = calculateTimeDistanceTable(refPointsMissed);
  const rollingDurationDistances = calculateRollingDurationDistances(timeDistanceTable);

  const distances = rollingDurationDistances.map((el) => el.rollingDurationDistance);
  const rollingDurationMinDistance = Math.min(...distances.filter((el) => el != null));

  const startIndex = distances.indexOf(rollingDurationMinDistance);
  const endIndex = rollingDurationDistances[startIndex]?.rollingDurationEndIndex;

  const startElapsedTime = timeDistanceTable[startIndex]?.elapsedChallTime;
  const endElapsedTime = timeDistanceTable[endIndex]?.elapsedChallTime;

  const startDistance = timeDistanceTable[startIndex]?.cumulatedDistance;
  const endDistance = timeDistanceTable[endIndex]?.cumulatedDistance;

  const slowestSegmentStart = {
    index: startIndex,
    elapsedTime: startElapsedTime,
    // Distance travelled by challenger on ref track (without missed segments):
    distance: startDistance,
  };

  const slowestSegmentEnd = {
    index: endIndex,
    elapsedTime: endElapsedTime,
    // Distance travelled by challenger on ref track (without missed segments):
    distance: endDistance,
  };

  const meanSpeed = (slowestSegmentEnd.distance - slowestSegmentStart.distance)
  / (endElapsedTime - startElapsedTime);

  return {
    slowestSegmentStart,
    slowestSegmentEnd,
    meanSpeed,
  };
};

const compareGpx = async (inputs) => {
  const {
    refGpxStr,
    challGpxStr,
    options,
  } = inputs;

  // Parse GPX strings to JS objects
  const refPoints = parseGpx(refGpxStr);
  const challPoints = parseGpx(challGpxStr);

  // Extend refPoints with missed segments
  const refPointsPassBy = calculateClosest(refPoints, challPoints, options);
  const refPointsMissed = calculateMissed(refPointsPassBy);

  // Generate missed segments & accuracy
  const missedSegments = generateMissedSegments(refPointsMissed);
  const accuracy = calculateAccuracy(refPoints, missedSegments);

  // Tourmagne Kpis
  const kpi = calculateKpis(refPointsMissed);

  return {
    inputs,
    missedSegments,
    accuracy,
    kpi,
  };
};

module.exports = compareGpx;
