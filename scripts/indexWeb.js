const mapboxgl = require('mapbox-gl/dist/mapbox-gl');
const FileSaver = require('file-saver');

const parseGpx = require('./services/parseGpx');
const generateFullGpxStr = require('./services/generateFullGpxStr');
const compareTracks = require('./services/compareTracks');
const displayTrack = require('./mapHelpers/displayTrack');
const msToHHMM = require('./helper/msToHHMM');
const { updateBounds, fitBounds } = require('./mapHelpers/updateBounds');

// ------ GLOBAL VARIABLES ------//
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
const perfEl = document.querySelector('#perf');
const perfTitleEl = document.querySelector('#perfTitle');
const downloadGpxEl = document.querySelector('#downloadGpx');
// const launchComparisonEl = document.querySelector('#launchComparisonBtn');

let refPoints;
let gpxStrFull = '';
const geolibBounds = {};

// ------ HELPERS ------//
const updateDom = (results) => {
  refParamEl.innerHTML = refFileInputEl.files[0].name;
  challParamEl.innerHTML = Array.from(challFileInputEl.files).reduce((acc, file) => `${acc}${file.name}, `, '').slice(0, -2);

  durationParamEl.innerHTML = `${formEl.rollingDuration.value} h`;
  triggerParamEl.innerHTML = `${formEl.trigger.value} m`;
  toleranceParamEl.innerHTML = `${formEl.tolerance.value} m`;
  detourMaxParamEl.innerHTML = `${formEl.maxDetour.value} km`;
  missedDistanceEl.innerHTML = `${Math.round(results.accuracy.missedDistance / 100) / 10} km (soit ${Math.round(results.accuracy.offTrackRatio * 10000) / 100} %)`;
  perfTitleEl.innerHTML = `Distance de la trace parcourue pendant les ${results.kpi.rollingDuration} h les moins favorables`;
  perfEl.innerHTML = `${results.kpi.distance / 1000} km (à partir du km ${results.kpi.slowestSegmentStart.distance / 1000} de la trace de référence, soit après  ${msToHHMM(results.kpi.slowestSegmentStart.elapsedTime)} à ${Math.round(results.kpi.meanSpeed * 1000) / 1000} km/h de moyenne)`;
};

// ------ EVENT LISTENERS ------//
const launchComparison = (event) => {
  event.preventDefault();

  // TODO: not working because every method afterwards is synchronous
  // launchComparisonEl.classList.remove('btn-primary');
  // launchComparisonEl.classList.add('btn-danger');

  const {
    map,
  } = event.currentTarget;

  // Get options from form inputs
  const options = {
    rollingDuration: parseInt(formEl.rollingDuration.value, 10), // in seconds
    trigger: parseInt(formEl.trigger.value, 10), // in meters - trigger must be less than tolerance
    tolerance: parseInt(formEl.tolerance.value, 10), // in meters
    maxDetour: parseInt(formEl.maxDetour.value, 10) * 1000, // in meters
    maxSegLength: parseInt(formEl.maxSegLength.value, 10), // in meters
  };

  let results;
  try {
    results = compareTracks(
      refFileInputEl.points.flat(),
      challFileInputEl.points.flat(),
      options,
    );
  } catch (err) {
    alert(err.message);
    return;
  }

  // Update DOM
  updateDom(results);

  // Update map
  const paintMissed = {
    'line-color': '#ff0000',
    'line-width': 6,
    'line-opacity': 0.7,
  };
  displayTrack(map, 'missed', results.tracks.missedSegments, paintMissed);

  const paintSlowest = {
    'line-color': '#ffffff',
    'line-width': 2,
    'line-opacity': 1,
  };
  displayTrack(map, 'slowest', results.tracks.worst, paintSlowest);

  // Generate the downloadable files
  gpxStrFull = generateFullGpxStr(results);
  downloadGpxEl.classList.remove('disabled');
};

const downloadFile = () => {
  const blob = new Blob(
    [gpxStrFull],
    { type: 'text/plain;charset=utf-8' },
  );

  FileSaver.saveAs(blob, 'gpsvisualizerSynthesis.gpx');
};

// load files
const loadFiles = async (event) => {
  const {
    currentTarget,
    currentTarget: {
      files,
      id,
      color,
      map,
    },
  } = event;

  if (files.length > 0) {
    const promises = Array.from(files).map((file) => file.text());
    const strs = await Promise.all(promises);

    try {
      currentTarget.points = parseGpx(strs);
    } catch (err) {
      alert(err.message);
      currentTarget.value = '';
      return;
    }
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
  const paint = {
    'line-color': color,
    'line-width': 4,
    'line-opacity': 0.7,
  };
  displayTrack(map, id, currentTarget.points, paint);
  geolibBounds[id] = updateBounds(map, geolibBounds, currentTarget.points);
  fitBounds(map, geolibBounds);

  if (id === 'ref') {
    refPoints = [...currentTarget.points.flat()];
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
  challFileInputEl.color = '#009100';
  challFileInputEl.map = map;
  challFileInputEl.geolibBounds = geolibBounds;

  refFileInputEl.addEventListener('change', loadFiles);
  challFileInputEl.addEventListener('change', loadFiles);

  // Event listener for comparison launch
  formEl.map = map;
  formEl.addEventListener('submit', launchComparison);

  // Event listener for downloading gpx file of the gaps
  downloadGpxEl.addEventListener('click', downloadFile);
});
