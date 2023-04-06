/* eslint-disable no-console */

// Logs comparator analysis
const logComparisonResults = (results) => {
  const displayString = `

  Analysis summary:
  -----------------
  Reference gpx file: ${results.inputs.refPath}
  Challenger gpx file: ${results.inputs.challPath}
  Rolling duration: ${results.inputs.options.rollingDuration}
  Trigger distance: ${results.inputs.options.trigger}
  Tolerance distance: ${results.inputs.options.tolerance}
  Max detour: ${results.inputs.options.maxDetour}

  Missed distance of the reference path: ${results.accuracy.missedDistance} meters
  Missed distance of the reference path: ${results.accuracy.onTrackRatio * 100} %
  Worst ${results.inputs.options.rollingDuration} hours:
   - Started after ${results.kpi.slowestSegmentStart.elapsedTime} hours at km ${results.kpi.slowestSegmentStart.distance} travelled on reference track
   - Distance: ${results.kpi.distance} km
   - Mean speed during this period: ${results.kpi.meanSpeed} km/h
  `;

  console.log(displayString);
};

module.exports = logComparisonResults;
