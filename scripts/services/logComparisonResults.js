/* eslint-disable no-console */

// Logs comparator analysis
const logComparisonResults = (inputParams, results) => {
  const displayString = `

  Analysis summary:
  -----------------
  Reference gpx file: ${inputParams.refPaths[0].split('/').slice(-1)}
  Challenger gpx files: ${inputParams.challPaths.reduce((acc, path) => `${acc}${path.split('/').slice(-1)}, `, '').slice(0, -2)}
  Rolling duration: ${inputParams.options.rollingDuration}
  Trigger distance: ${inputParams.options.trigger}
  Tolerance distance: ${inputParams.options.tolerance}
  Max detour: ${inputParams.options.maxDetour}

  Missed distance of the reference path: ${results.accuracy.missedDistance} meters
  Missed distance of the reference path: ${results.accuracy.offTrackRatio * 100} %
  Worst ${inputParams.options.rollingDuration} hours:
   - Started after ${Math.round((results.kpi.slowestSegmentStart.elapsedTime / (3600 * 1000)) * 100) / 100} hours at km ${results.kpi.slowestSegmentStart.distance / 1000} travelled on reference track
   - Distance: ${results.kpi.distance / 1000} km
   - Mean speed during this period: ${results.kpi.meanSpeed} km/h
  `;

  console.log(displayString);
};

module.exports = logComparisonResults;
