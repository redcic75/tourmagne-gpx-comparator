const mapboxgl = require('mapbox-gl/dist/mapbox-gl');

const parseGpx = require('./services/parseGpx');
const compareGpx = require('./services/compareGpx');
const displayTrack = require('./services/displayTrack');
const { updateBounds, fitBounds } = require('./services/updateBounds');

// Links with HTML file
const refFileInputEl = document.querySelector('#ref');
const challFileInputEl = document.querySelector('#chall');
const formEl = document.querySelector('#form');
const refParamEl = document.querySelector('#refParam');
const challParamEl = document.querySelector('#challParam');
const triggerParamEl = document.querySelector('#triggerParam');
const toleranceParamEl = document.querySelector('#toleranceParam');
const detourMaxParamEl = document.querySelector('#detourMaxParam');
const missedDistanceEl = document.querySelector('#missedDistance');
const missedPercentEl = document.querySelector('#missedPercent');
const perfEl = document.querySelector('#perf');

// ------ FUNCTIONS ------//
const launchComparison = async (event) => {
  event.preventDefault();

  const {
    map,
  } = event.currentTarget;

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
  refParamEl.innerHTML = formEl.ref.value;
  challParamEl.innerHTML = formEl.chall.value;
  triggerParamEl.innerHTML = `${formEl.trigger.value} m`;
  toleranceParamEl.innerHTML = `${formEl.tolerance.value} m`;
  detourMaxParamEl.innerHTML = `${formEl.trigger.value} km`;
  missedDistanceEl.innerHTML = `${Math.round(missedDistance)} m`;
  missedPercentEl.innerHTML = `${Math.round(missedDistance / (refDistance * 1000)) / 10} %`;
  perfEl.innerHTML = 'TODO';

  // Update map
  displayTrack(map, 'missed', '#ff0000', missedSegmentsOffTolerance);
};

// load files
const loadFile = async (event) => {
  const {
    currentTarget,
    currentTarget: {
      files,
      id,
      color,
      map,
      geolibBounds,
    },
  } = event;

  const file = files[0];

  if (file) {
    const str = await file.text();
    currentTarget.points = parseGpx(str);
  } else {
    currentTarget.points = [];

    // Erase track
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
    if (map.getSource(id)) {
      map.removeSource(id);
    }
  }

  // Erase missed points tracks
  if (map.getLayer('missed')) {
    map.removeLayer('missed');
  }
  if (map.getSource('missed')) {
    map.removeSource('missed');
  }

  // Display track and update bounds
  displayTrack(map, id, color, [currentTarget.points]);
  geolibBounds[id] = updateBounds(map, geolibBounds, [currentTarget.points]);
  fitBounds(map, geolibBounds);
};

// ------ MAIN ------//
// Display empty map
mapboxgl.accessToken = 'pk.eyJ1IjoicmVkY2ljIiwiYSI6ImNsZG41YzZzMjAweGYzbnEwMjYzOWxpMTYifQ.kEkg6g7sPVWFAf0vvAVzkA';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [3.11, 46.42], // Display Melun - Nîme zone
  zoom: 6,
});
map.addControl(new mapboxgl.NavigationControl());

const geolibBounds = {};

map.on('load', () => {
  // Event listeners for file loads
  refFileInputEl.id = 'ref';
  refFileInputEl.color = '#233677';
  refFileInputEl.map = map;
  refFileInputEl.geolibBounds = geolibBounds;

  challFileInputEl.id = 'chall';
  challFileInputEl.color = '#00ff3f';
  challFileInputEl.map = map;
  challFileInputEl.geolibBounds = geolibBounds;

  refFileInputEl.addEventListener('change', loadFile);
  challFileInputEl.addEventListener('change', loadFile);

  // Event listener for comparison launch
  formEl.map = map;
  formEl.addEventListener('submit', launchComparison);
});
