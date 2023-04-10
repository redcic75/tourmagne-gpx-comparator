const geolib = require('geolib');
const { XMLParser } = require('fast-xml-parser');

// Calculate challenger passage time at each ref point
// -> [{lat, lon, time, closestDist}]
// * lat: ref point latitude
// * lon: ref point longitude
// * time: time elapsed since challenger passed by its 1st ref point
//   null if ref point missed
// * closestDistance: distance between ref point & challenger
//   when challenger was the closest (before maxDetour)
const calculateClosest = (refPoints, challPoints, options) => {
  const {
    trigger,
    maxDetour,
  } = options;

  const initialTime = new Date(challPoints[0].time).valueOf();

  // geolib getDistanceFromLine wrapper to fix a bug from the library
  // See https://github.com/manuelbieh/geolib/issues/227
  const getDistanceFromLine = (point, lineStart, lineEnd, accuracy = 1) => {
    const d1 = geolib.getDistance(lineStart, point, accuracy);
    const d2 = geolib.getDistance(point, lineEnd, accuracy);
    const d3 = geolib.getDistance(lineStart, lineEnd, accuracy);

    if (d1 === 0 || d2 === 0) {
      // point located at the exact same place as lineStart or lineEnd
      return 0;
    }
    if (d3 === 0) {
      return d1; // lineStart and lineEnd are the same - return point-to-point distance
    }
    return geolib.getDistanceFromLine(point, lineStart, lineEnd);
  };

  // challIndex: index of the point of challenger track that was
  // at less than trigger distance from the last found ref point
  let challIndex = 0;

  return refPoints.map((refPoint) => {
    // challLocalIndex: running index on challenge track used to find closest point
    let challLocalIndex = challIndex;
    let detour = 0;
    let closestDistanceIndex;
    let closestDistance;

    while (challLocalIndex + 1 < challPoints.length && detour <= maxDetour) {
      const distance = getDistanceFromLine(
        refPoint,
        challPoints[challLocalIndex],
        challPoints[challLocalIndex + 1],
      );

      if (!closestDistance || distance < closestDistance) {
        closestDistance = distance;
        closestDistanceIndex = challLocalIndex;
      }

      if (closestDistance <= trigger) {
        challIndex = challLocalIndex;
        break;
      }

      detour += geolib.getDistance(challPoints[challLocalIndex], challPoints[challLocalIndex + 1]);
      challLocalIndex += 1;
    }

    return {
      lat: refPoint.lat,
      lon: refPoint.lon,
      time: new Date(challPoints[closestDistanceIndex].time).valueOf() - initialTime,
      closestDistance,
    };
  });
};

// Calculate ref points the challenger missed
// -> [{lat, lon, time, missedSegmentNb}]
// * missedSegmentNb: undefined if ref point reached by the challenger
//   Integer representing the number of the missed segment starting at 1
const calculateMissed = (refPointsPassBy, options) => {
  const {
    trigger,
    tolerance,
  } = options;

  const result = new Array(refPointsPassBy.length);
  let segmentNb = 1;
  let ind = 0;

  while (ind < refPointsPassBy.length) {
    if (refPointsPassBy[ind].closestDistance <= trigger) {
      result[ind] = null;
      ind += 1;
    } else {
      const startInd = ind;
      let localInd = ind;
      let missed = false;
      while (
        localInd < refPointsPassBy.length
        && refPointsPassBy[localInd].closestDistance > trigger
      ) {
        if (refPointsPassBy[localInd].closestDistance > tolerance) missed = true;
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
const calculateRollingDurationDistances = (timeDistanceTable, rollingDuration) => {
  const rollingDurationMs = rollingDuration * 3600 * 1000; // in ms
  let endInd = 0;

  return timeDistanceTable.map((point, startInd, table) => {
    let rollingDurationDistance;
    let rollingDurationEndIndex;

    const endTime = point.elapsedTime + rollingDurationMs;

    while (endInd < table.length) {
      if (table[endInd].elapsedTime !== null && table[endInd].elapsedTime > endTime) {
        break;
      }
      endInd += 1;
    }

    if (endInd === table.length) {
      rollingDurationDistance = null;
      rollingDurationEndIndex = null;
    } else {
      // TODO: cumulatedDistance or cumulatedDistanceWithoutMissed
      rollingDurationDistance = table[endInd].cumulatedDistance - table[startInd].cumulatedDistance;
      rollingDurationEndIndex = endInd;
    }

    return ({
      rollingDurationDistance,
      rollingDurationEndIndex,
    });
  });
};

// Calculate elapsed challenger time & cumulated distance (with & without missed segments)
// -> [{elapsedTime, elapsedTimeWithoutMissed, cumulatedDistance, cumulatedDistanceWithoutMissed}]
// * elapsedTime: time elapsed since challenger passed by its 1st ref point
// * elapsedTimeWithoutMissed: time elapsed since challenger passed by its 1st ref point
//   null if ref point missed
// * cumulatedDistance: cumulated distance on ref track
// * cumulatedDistanceWithoutMissed: cumulated distance on ref track
//   excluding segments missed by challenger
const calculateTimeDistanceTable = (refPointsMissed) => {
  let cumulatedDistance = 0;
  let cumulatedDistanceWithoutMissed = 0;

  return refPointsMissed.map((point, ind, points) => {
    let elapsedTime;
    let elapsedTimeWithoutMissed;

    if (ind === 0) {
      elapsedTime = 0;
      elapsedTimeWithoutMissed = 0;
    } else {
      const intervalDistance = geolib.getDistance(point, points[ind - 1]);
      elapsedTime = point.time;
      cumulatedDistance += intervalDistance;
      if (point.missedSegmentNb === null) {
        elapsedTimeWithoutMissed = elapsedTime;
        cumulatedDistanceWithoutMissed += intervalDistance;
      } else {
        elapsedTimeWithoutMissed = null;
        cumulatedDistanceWithoutMissed = null;
      }
    }
    return {
      elapsedTime,
      elapsedTimeWithoutMissed,
      cumulatedDistance,
      cumulatedDistanceWithoutMissed,
    };
  });
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
// -> [[{lat, lon}]]
// * Wrapping array is an array of segments
// * Nested arrays are missed segments
const generateMissedSegments = (refPointsMissed) => {
  const missedSegments = [];
  const numberOfMissedSegments = Math.max(...refPointsMissed
    .map((point) => point.missedSegmentNb)
    .filter((point) => point !== null));

  for (let segmentNb = 1; segmentNb <= numberOfMissedSegments; segmentNb += 1) {
    const missedSegment = refPointsMissed.filter((point) => point.missedSegmentNb === segmentNb);
    const missedSegmentCoordsOnly = missedSegment.map((point) => ({
      lat: point.lat,
      lon: point.lon,
    }));

    missedSegments.push(missedSegmentCoordsOnly);
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
  const offTrackRatio = missedDistance / refDistance;

  return {
    refDistance,
    missedDistance,
    offTrackRatio,
  };
};

// Calculate Tourmagne Kpis
const calculateKpis = (refPointsMissed, options) => {
  const {
    rollingDuration,
  } = options;
  const timeDistanceTable = calculateTimeDistanceTable(refPointsMissed);
  const rollingDurationDistances = calculateRollingDurationDistances(
    timeDistanceTable,
    rollingDuration,
  );

  const distances = rollingDurationDistances.map((el) => el.rollingDurationDistance);
  const rollingDurationMinDistance = Math.min(...distances.filter((el) => el != null));

  const startIndex = distances.indexOf(rollingDurationMinDistance);
  const endIndex = rollingDurationDistances[startIndex]?.rollingDurationEndIndex;

  // TODO: without missed ?
  const startElapsedTime = timeDistanceTable[startIndex]?.elapsedTime;
  const endElapsedTime = timeDistanceTable[endIndex]?.elapsedTime;

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

  const distance = slowestSegmentEnd.distance - slowestSegmentStart.distance; // meters
  const meanSpeed = (distance / 1000) / rollingDuration; // km/h

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
  const kpi = calculateKpis(refPointsMissed, options);

  return {
    inputs,
    missedSegments,
    accuracy,
    kpi,
  };
};

module.exports = compareGpx;
