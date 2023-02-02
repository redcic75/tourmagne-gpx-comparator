const parseGpx = require('./parseGpx');
const compareGpx = require('./compareGpx');
const displayTrack = require('./displayTrack');
const generateGpx = require('./generateGpx');

// Links with HTML file
const refFileInputEl = document.querySelector('#ref');
const challFileInputEl = document.querySelector('#chall');
const formEl = document.querySelector('#form')
const missedDistanceEl = document.querySelector('#missedDistance');
const missedPercentEl = document.querySelector('#missedPercent');


// ------ FUNCTIONS ------//
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
  missedDistanceEl.innerHTML = `${Math.round(missedDistance)} m`;
  missedPercentEl.innerHTML = `${Math.round(missedDistance / refDistance * 1000) / 10} %`;

  // Update map
  missedSegmentsOffTolerance.forEach(async (segment, index) => {
    displayTrack(map, `missed-${index}`, '#ff0000', segment);
  });
  //

};

// load files
const loadFile = async (evt) => {
  const currentTarget = evt.currentTarget;
  const file = evt.currentTarget.files[0];
  const id = evt.currentTarget.id;
  const color = evt.currentTarget.color;

  const str = await file.text();
  currentTarget.points = parseGpx(str);

  displayTrack(map, id, color, currentTarget.points);
}

// ------ MAIN ------//
// Display empty map
mapboxgl.accessToken = 'pk.eyJ1IjoicmVkY2ljIiwiYSI6ImNsZG41YzZzMjAweGYzbnEwMjYzOWxpMTYifQ.kEkg6g7sPVWFAf0vvAVzkA';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-0.6, 44.81],
  zoom: 13,
});
map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
  // Event listeners
  refFileInputEl.id = 'ref';
  refFileInputEl.color = '#233677';

  challFileInputEl.id = 'chall';
  challFileInputEl.color = '#00ff3f';

  refFileInputEl.addEventListener('change', loadFile);
  challFileInputEl.addEventListener('change', loadFile);
  formEl.addEventListener('submit', launchComparison);
});
