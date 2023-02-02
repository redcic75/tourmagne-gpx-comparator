const geolib = require('geolib');

// Calculate total distance of a track segment (represented by an array of points)
const calculateTotalDistance = (points) => {
  let distance = 0;
  for (let i = 1; i < points.length; i++) {
    distance += geolib.getDistance(points[i-1], points[i]);
  }
  return distance;
}

const calculate = async (refPoints, challPoints, options) => {
  const {
    trigger,
    tolerance,
    maxDetour,
  } = options;

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

  // Calculate and display synthesis
  const refDistance = calculateTotalDistance(refPoints);
  const missedDistance = missedSegmentsOffTolerance.reduce((acc, segment) => acc + calculateTotalDistance(segment), 0);

  return {
    missedSegmentsOffTolerance,
    refDistance,
    missedDistance,
  }
}

module.exports = calculate;
