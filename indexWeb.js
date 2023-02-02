const parseGpx = require('./parseGpx');
const compareGpx = require('./compareGpx');

// Links with HTML file
const refFileInputEl = document.querySelector('#ref');
const challFileInputEl = document.querySelector('#chall');
const formEl = document.querySelector('#form')
const missedDistanceEl = document.querySelector('#missedDistance');
const missedPercentEl = document.querySelector('#missedPercent');

const launchComparison = async (event) => {
  event.preventDefault();

  // Get options from form inputs
  const options = {
    trigger: formEl.trigger.value, // in meters - trigger must be less than tolerance
    tolerance: formEl.tolerance.value, // in meters
    maxDetour: formEl.maxDetour.value * 1000, // in meters
  };
  const {
    missedSegmentsOffTolerance,
    refDistance,
    missedDistance,
  } = await compareGpx(
    refFileInputEl.points,
    challFileInputEl.points,
    options,
  );

  // Update DOM
  missedDistanceEl.innerHTML = `Missed distance of the reference path: ${Math.round(missedDistance)} m`;
  missedPercentEl.innerHTML = `Missed % of the reference path: ${Math.round(missedDistance / refDistance * 1000) / 10} %`
};

// load files
const loadFile = async (evt) => {
  const currentTarget = evt.currentTarget;
  const file = evt.currentTarget.files[0];
  const str = await file.text();
  currentTarget.points = parseGpx(str);
}

// Event listeners
refFileInputEl.addEventListener('change', loadFile);
challFileInputEl.addEventListener('change', loadFile);
formEl.addEventListener('submit', launchComparison);
