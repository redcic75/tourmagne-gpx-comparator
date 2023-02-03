const mapboxgl = require('mapbox-gl/dist/mapbox-gl');
const FileSaver = require('file-saver');

const generateGpxStr = require('./services/generateGpxStr');
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
const durationParamEl = document.querySelector('#durationParam');
const triggerParamEl = document.querySelector('#triggerParam');
const toleranceParamEl = document.querySelector('#toleranceParam');
const detourMaxParamEl = document.querySelector('#detourMaxParam');
const missedDistanceEl = document.querySelector('#missedDistance');
const missedPercentEl = document.querySelector('#missedPercent');
const perfWhenEl = document.querySelector('#perfWhen');
const perfKmEl = document.querySelector('#perfKm');
const downloadGpxEl = document.querySelector('#downloadGpx');

let gpxStr = '';
const geolibBounds = {};
let refPoints;

// ------ FUNCTIONS ------//
const launchComparison = async (event) => {
  event.preventDefault();

  const {
    map,
  } = event.currentTarget;

  // Get options from form inputs
  const options = {
    duration: formEl.duration.value, // in seconds
    trigger: formEl.trigger.value, // in meters - trigger must be less than tolerance
    tolerance: formEl.tolerance.value, // in meters
    maxDetour: formEl.maxDetour.value * 1000, // in meters
  };
  const {
    missedSegmentsOffTolerance,
    refDistance,
    missedDistance,
    perf,
    pt,
  } = await compareGpx(
    refFileInputEl.points,
    challFileInputEl.points,
    options,
  );

  // Update DOM
  refParamEl.innerHTML = formEl.ref.value.split('\\').slice(-1);
  challParamEl.innerHTML = formEl.chall.value.split('\\').slice(-1);

  durationParamEl.innerHTML = `${formEl.duration.value} h`;
  triggerParamEl.innerHTML = `${formEl.trigger.value} m`;
  toleranceParamEl.innerHTML = `${formEl.tolerance.value} m`;
  detourMaxParamEl.innerHTML = `${formEl.trigger.value} km`;
  missedDistanceEl.innerHTML = `${Math.round(missedDistance)} m`;
  missedPercentEl.innerHTML = `${Math.round((missedDistance / refDistance) * 1000) / 10} %`;
  perfKmEl.innerHTML = `Vitesse moyenne pendant les pires ${formEl.duration.value} h : ${Math.round(perf.speed) / 1000} km/h`;
  perfWhenEl.innerHTML = `Période commencée après ${Math.round(pt[perf.startRefIndex].time / (3600 * 10)) / 100} h au km ${pt[perf.startRefIndex].cumulatedDistance / 1000}`;

  // Update map
  displayTrack(map, 'missed', '#ff0000', missedSegmentsOffTolerance);
  displayTrack(map, 'slowest', '#000000', [refPoints.slice(perf.startRefIndex, perf.endRefIndex + 1)]);

  // Generate the file containing the missed segments
  gpxStr = await generateGpxStr(missedSegmentsOffTolerance, options);
  downloadGpxEl.classList.remove('disabled');
};

const downloadFile = () => {
  const filename = 'écart.gpx';

  const blob = new Blob([gpxStr], {
    type: 'text/plain;charset=utf-8',
  });

  FileSaver.saveAs(blob, filename);
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

  // Erase missed points and slowest zone tracks
  ['missed', 'slowest'].forEach((trackId) => {
    if (map.getLayer(trackId)) {
      map.removeLayer(trackId);
    }
    if (map.getSource(trackId)) {
      map.removeSource(trackId);
    }
  });

  // Display track and update bounds
  displayTrack(map, id, color, [currentTarget.points]);
  geolibBounds[id] = updateBounds(map, geolibBounds, [currentTarget.points]);
  fitBounds(map, geolibBounds);

  if (id === 'ref') {
    refPoints = [...currentTarget.points];
  }
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

map.on('load', () => {
  // Event listeners for file loads
  refFileInputEl.id = 'ref';
  refFileInputEl.color = '#0000ff';
  refFileInputEl.map = map;
  refFileInputEl.geolibBounds = geolibBounds;

  challFileInputEl.id = 'chall';
  challFileInputEl.color = '#00ff00';
  challFileInputEl.map = map;
  challFileInputEl.geolibBounds = geolibBounds;

  refFileInputEl.addEventListener('change', loadFile);
  challFileInputEl.addEventListener('change', loadFile);

  // Event listener for comparison launch
  formEl.map = map;
  formEl.addEventListener('submit', launchComparison);

  // Event listener for downloading gpx file of the gaps
  downloadGpxEl.addEventListener('click', downloadFile);
});
