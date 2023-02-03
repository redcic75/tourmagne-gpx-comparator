/* eslint-disable no-extra-label */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-labels */

const geolib = require('geolib');

// Calculate total distance of a track segment (represented by an array of points)
const calculateTotalDistance = (points) => {
  let distance = 0;
  for (let i = 1; i < points.length; i += 1) {
    distance += geolib.getDistance(points[i - 1], points[i]);
  }
  return distance;
};

const compareGpx = async (refPoints, challPoints, options) => {
  const {
    duration,
    trigger,
    tolerance,
    maxDetour,
  } = options;

  // passageTimes is an array containing cumulative distances from refPoints start
  // This array will then be extended with challenger passage time
  const passageTimes = [{
    refIndex: 0,
    cumulatedDistance: 0,
  }];
  for (let refIndex = 1; refIndex < refPoints.length; refIndex += 1) {
    const cumulatedDistance = passageTimes[refIndex - 1].cumulatedDistance
      + geolib.getDistance(refPoints[refIndex - 1], refPoints[refIndex]);
    passageTimes.push({
      refIndex,
      cumulatedDistance,
    });
  }

  // Initialize the missedSegments array
  // This array will contain segment arrays
  // Each segment array will contain consecutive missed trackpoints
  const missedSegments = [[]];

  let challIndex = 0;

  // Loop through all reference track points
  refIndexLoop:
  for (let refIndex = 0; refIndex < refPoints.length; refIndex += 1) {
    const refPoint = refPoints[refIndex];

    // Log progress
    // eslint-disable-next-line no-console
    console.log(Math.floor((refIndex / refPoints.length) * 1000) / 10);

    let challDetour = 0;
    let minDist; // minimum distance between current refPoint and chall track;
    challIndexLoop:
    for (
      let challLocalIndex = challIndex;
      challLocalIndex < challPoints.length - 1;
      challLocalIndex += 1) {
      const dist = geolib.getDistanceFromLine(
        refPoint,
        challPoints[challLocalIndex],
        challPoints[challLocalIndex + 1],
      );

      if (!minDist || dist < minDist) {
        minDist = dist;
        passageTimes[refIndex].time = new Date(challPoints[challIndex].time).valueOf();
      }

      if (dist <= trigger) {
        challIndex = challLocalIndex;
        continue refIndexLoop;
      }

      challDetour += geolib.getDistance(
        challPoints[challLocalIndex],
        challPoints[challLocalIndex + 1],
      );

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
    const lastMissedSegment = missedSegments[missedSegments.length - 1];

    // Append to lastMissedSegment only if current missing trackpoint from reference
    // immediatly follows the last one added.
    // If not create a new segment in missedSegments.
    if (lastMissedSegment.length === 0
      || lastMissedSegment[lastMissedSegment.length - 1].index === refIndex - 1) {
      lastMissedSegment.push(refPoint);
    } else {
      missedSegments.push([refPoint]);
    }
  }

  // Filter out passageTimes points where challenger did not pass
  // Filter out passageTimes points where time is < duration
  const initialTime = passageTimes[0].time;
  // eslint-disable-next-line arrow-body-style
  const pt = passageTimes.map((passageTime) => {
    return {
      ...passageTime,
      time: passageTime.time - initialTime,
    };
  });

  // Find worst period
  for (let iEnd = 0; iEnd < pt.length; iEnd += 1) {
    const endTime = pt[iEnd].time;
    const startTime = Math.max(0, endTime - duration * 3600 * 1000);
    let iStart = 0;
    while (pt[iStart].time < startTime) {
      iStart += 1;
    }
    pt[iEnd].lastIntervalDistance = pt[iEnd].cumulatedDistance - pt[iStart].cumulatedDistance;
    pt[iEnd].startRefIndex = pt[iStart].refIndex;
  }

  let perf;
  for (let i = 0; i < pt.length; i += 1) {
    if (pt[i].time > duration * 3600 * 1000
      && (!perf || pt[i].lastIntervalDistance < perf.distance)) {
      perf = {
        distance: pt[i].lastIntervalDistance,
        startRefIndex: pt[i].startRefIndex,
        endRefIndex: pt[i].refIndex,
      };
    }
  }
  perf.speed = (perf.distance / (pt[perf.endRefIndex].time - pt[perf.startRefIndex].time))
    * 3600 * 1000;

  // Filter out missedSegment where max of minDist is < tolerance
  const missedSegmentsOffTolerance = missedSegments.filter(
    (segment) => segment.some(
      (point) => point.dist > tolerance,
    ),
  );

  // Calculate and display synthesis
  const refDistance = calculateTotalDistance(refPoints);
  const missedDistance = missedSegmentsOffTolerance
    .reduce((acc, segment) => acc + calculateTotalDistance(segment), 0);

  return {
    missedSegmentsOffTolerance,
    refDistance,
    missedDistance,
    perf,
    pt,
  };
};

module.exports = compareGpx;
