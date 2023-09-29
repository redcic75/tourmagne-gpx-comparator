/* eslint-disable no-console */

const datePlusDurationToStr = require('../helper/datePlusDurationToStr');

// Logs comparator analysis
const logComparisonResults = (inputParams, results) => {
  const {
    dateStr,
    timeStr,
  } = datePlusDurationToStr(new Date(results.tracks.chall[0][0].time), results.kpi.slowestSegmentStart.elapsedTime, 'en-EN');

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
   - Started on ${dateStr} at ${timeStr} at km ${results.kpi.slowestSegmentStart.distance / 1000} on reference track
   - Distance: ${results.kpi.distance / 1000} km
   - Mean speed during this period: ${results.kpi.meanSpeed} km/h
  `;

  console.log(displayString);
};

module.exports = logComparisonResults;
