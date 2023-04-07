const geolib = require('geolib');
const { XMLParser } = require('fast-xml-parser');

// Calculate challenger passage time at each ref point
// -> [{latRef, lonRef, time, closestDist}]
// * latRef: ref point latitude
// * lonRef: ref point longitude
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

  // challIndex: index of the point of challenger track that was
  // at less than trigger distance from the last found ref point
  let challIndex = 0;
  return refPoints.map((refPoint) => {
    // challLocalIndex: running index on challenge track used to find closest point
    let challLocalIndex = challIndex;
    let detour = 0;
    let minDistance;
    let minDistanceIndex;

    while (
      challLocalIndex + 1 < challPoints.length
      && detour <= maxDetour
    ) {
      let distance;
      if (
        (challPoints[challLocalIndex].lat === challPoints[challLocalIndex + 1].lat)
        && (challPoints[challLocalIndex].lon === challPoints[challLocalIndex + 1].lon)
      ) {
        distance = geolib.getDistance(
          refPoint,
          challPoints[challLocalIndex],
        );
      } else {
        distance = geolib.getDistanceFromLine(
          refPoint,
          challPoints[challLocalIndex],
          challPoints[challLocalIndex + 1],
        );
      }
      // If all points are too close together the getDistanceFromLine might return NaN =>
      if (Number.isNaN(distance)) distance = 0;

      if (!minDistance || distance < minDistance) {
        minDistance = distance;
        minDistanceIndex = challLocalIndex;
      }

      if (minDistance < trigger) {
        challIndex = challLocalIndex;
        break;
      }
      detour += geolib.getDistance(
        challPoints[challLocalIndex],
        challPoints[challLocalIndex + 1],
      );
      challLocalIndex += 1;
    }
    return {
      lat: refPoint.lat,
      lon: refPoint.lon,
      time: new Date(challPoints[minDistanceIndex].time).valueOf() - initialTime,
      closestDistance: minDistance,
    };
  });
};

// Calculate ref points the challenger missed
// -> [{latRef, lonRef, time, missedSegmentNb}]
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
const calculateRollingDurationDistances = (timeDistanceTable, rollingDuration) => {
  const rollingDurationMs = rollingDuration * 3600 * 1000; // in ms
  let endInd = 0;
  const todo = timeDistanceTable.map((point, startInd) => {
    const endTime = point.elapsedTime + rollingDurationMs;
    endInd = Math.max(startInd, endInd);
    while (endInd < timeDistanceTable.length
      && (timeDistanceTable[endInd].elapsedTime === null
          || timeDistanceTable[endInd].elapsedTime < endTime)) {
      endInd += 1;
    }
    if (endInd === timeDistanceTable.length) {
      return ({
        rollingDurationDistance: null,
        rollingDurationEndIndex: null,
      });
    }
    return ({
      rollingDurationDistance: timeDistanceTable[endInd].cumulatedDistance
                               - timeDistanceTable[startInd].cumulatedDistance,
      rollingDurationEndIndex: endInd,
    });
  });
  return todo;
};

// Calculate elapsed challenger time & cumulated distance (without missed segments)
// -> [{elapsedTime, cumulatedDistance}]
// * elapsedTime: time elapsed since challenger passed by its 1st ref point
//   null if ref point missed
// * cumulatedDistance: cumulated distance on ref track excluding segments missed by challenger
const calculateTimeDistanceTable = (refPointsMissed) => {
  // TODO: with array.slice and array.map
  const result = [{
    elapsedTime: 0,
    cumulatedDistance: 0,
  }];

  let lastNonNullCumulatedDistance = 0;

  for (let i = 1; i < refPointsMissed.length; i += 1) {
    if (refPointsMissed[i].missedSegmentNb === null) {
      const cumulatedDistance = geolib.getDistance(refPointsMissed[i], refPointsMissed[i - 1])
        + lastNonNullCumulatedDistance;
      result[i] = {
        time: refPointsMissed[i].time,
        cumulatedDistance,
      };
      lastNonNullCumulatedDistance = cumulatedDistance;
    } else {
      result[i] = {
        elapsedTime: null,
        cumulatedDistance: null,
      };
    }
  }

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
  // TODO: get rid of linter warning
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
