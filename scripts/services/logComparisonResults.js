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
  Max challenger segment length: ${inputParams.options.maxSegLength}

  Missed distance of the reference path: ${results.accuracy.missedDistance} meters
  Missed distance of the reference path: ${Math.round(results.accuracy.offTrackRatio * 10000) / 100} %
  Worst ${results.kpi.rollingDuration} hours:
   - Started at ${new Date(results.kpi.slowestSegmentStart.elapsedTime).toISOString().substring(11, 16).replace(':', 'h')} at km ${results.kpi.slowestSegmentStart.distance / 1000} on reference track
   - Distance: ${results.kpi.distance / 1000} km
   - Mean speed during this period: ${results.kpi.meanSpeed} km/h
  `;

  console.log(displayString);
};

module.exports = logComparisonResults;
