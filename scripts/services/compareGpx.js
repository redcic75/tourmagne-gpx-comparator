const geolib = require('geolib');
const { XMLParser } = require('fast-xml-parser');

// Calculate challenger passage time at each ref point
// -> [{latRef, lonRef, timeChall, closestDist}]
// * latRef: ref point latitude
// * lonRef: ref point longitude
// * timeChall: time when challenger passed the closest to ref point
// * closestDistance: distance between ref point & challenger
//   when challenger was the closest (before maxDetour)
// * missed: 0 if closestDistance < trigger
//           1 if closestDistance between trigger & tolerance
//           2 if closestDistance > tolerance
const calculateClosest = (refPoints, challPoints, options) => {
  const {
    trigger,
    maxDetour,
  } = options;

  // challIndex: index of the point of challenger track that was
  // at less than trigger distance from the last found ref point
  let challIndex = 0;
  return refPoints.map((refPoint) => {
    // challLocalIndex: running index on challenge track used to find closest point
    let challLocalIndex = challIndex;
    let detour = 0;
    let minDistance;
    let distance;

    while (
      challLocalIndex + 1 < challPoints.length
      && detour <= maxDetour
      && !(minDistance < trigger)
    ) {
      distance = geolib.getDistanceFromLine(
        refPoint,
        challPoints[challLocalIndex],
        challPoints[challLocalIndex + 1],
      );
      if (!minDistance || distance < minDistance) minDistance = distance;
      if (minDistance < trigger) challIndex = challLocalIndex;
      detour += geolib.getDistance(
        challPoints[challLocalIndex],
        challPoints[challLocalIndex + 1],
      );
      challLocalIndex += 1;
    }
    return {
      lat: refPoint.lat,
      lon: refPoint.lon,
      timeChall: challPoints[challLocalIndex].time,
      closestDistance: minDistance,
    };
  });
};

// Calculate ref points the challenger missed
// -> [{latRef, lonRef, timeChall, missedSegmentNb}]
// * missedSegmentNb: undefined if ref point reached by the challenger
//   Integer representing the number of the missed segment starting at 0
const calculateMissed = (refPointsPassBy, options) => {
  const {
    trigger,
    tolerance,
  } = options;

  const result = new Array(refPointsPassBy.length);
  let segmentNb = 0;
  let ind = 0;
  while (ind < refPointsPassBy.length) {
    if (refPointsPassBy[ind].closestDistance < trigger) {
      result[ind] = null;
      ind += 1;
    } else {
      const startInd = ind;
      let localInd = ind;
      let missed = false;
      while (
        localInd < refPointsPassBy.length
        && refPointsPassBy[localInd].closestDistance >= trigger
      ) {
        if (refPointsPassBy[localInd].closestDistance >= tolerance) missed = true;
        localInd += 1;
      }
      if (missed) {
        result.fill(segmentNb, startInd, localInd);
        segmentNb += 1;
      } else {
        result.fill(null, startInd, localInd);
      }
      ind = localInd;
    }
  }
  return refPointsPassBy.map((el, index) => ({
    ...el,
    missedSegmentNb: result[index],
  }));
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
const calculateTimeDistanceTable = (refPointsMissed) => {
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
const generateMissedSegments = (refPointsMissed) => {
  const missedSegments = [];
  let segmentNb = 0;
  let missedSegmentLeft = true;
  while (missedSegmentLeft) {
    const missedSegment = refPointsMissed.filter((point) => point.missedSegmentNb === segmentNb);
    if (missedSegment.length > 0) {
      missedSegments.push(missedSegment);
      segmentNb += 1;
    } else {
      missedSegmentLeft = false;
    }
  }
  return missedSegments;
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
  const missedDistance = missedSegments
    .reduce((acc, segment) => acc + calculateTotalDistance(segment), 0);
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

  const distance = slowestSegmentEnd.distance - slowestSegmentStart.distance;
  const meanSpeed = distance / (endElapsedTime - startElapsedTime);

  return {
    slowestSegmentStart,
    slowestSegmentEnd,
    distance,
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
  const refPointsMissed = calculateMissed(refPointsPassBy, options);

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
