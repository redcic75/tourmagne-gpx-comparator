/* eslint-disable no-alert */
const mapboxgl = require('mapbox-gl/dist/mapbox-gl');
const FileSaver = require('file-saver');
const parseGpx = require('./services/parseGpx');
const generateFullGpxStr = require('./services/generateFullGpxStr');
const displayTrack = require('./mapHelpers/displayTrack');
const msToHHMM = require('./helper/msToHHMM');
const { updateBounds, fitBounds } = require('./mapHelpers/updateBounds');

// ------ DOM ------//
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
const launchComparisonEl = document.querySelector('#launchComparisonBtn');

// ------ GLOBAL VARIABLES ------////
const refData = { id: 'ref', color: '#0000ff' };
const challData = { id: 'chall', color: '#009100' };
const geolibBounds = {};
let gpxStrFull = '';

mapboxgl.accessToken = 'pk.eyJ1IjoicmVkY2ljIiwiYSI6ImNsbTFuZjZ6cTNqMXUzZHB2dGFodXIweDgifQ._8eBSkTr0_-wUzUhIYB0zA'; // TODO: change back to URL specific token before merging in master

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [3.11, 46.42], // Display Melun - Nîme zone
  zoom: 6,
});
map.addControl(new mapboxgl.NavigationControl());

// ------ WORKERS ------////
const compareTracksWorker = new Worker(new URL('./services/compareTracks', import.meta.url));

// ------ METHODS ------//
const updateDom = (results) => {
  refParamEl.innerHTML = refData.files[0].name;
  challParamEl.innerHTML = Array.from(challData.files).reduce((acc, file) => `${acc}${file.name}, `, '').slice(0, -2);

  durationParamEl.innerHTML = `${formEl.rollingDuration.value} h`;
  triggerParamEl.innerHTML = `${formEl.trigger.value} m`;
  toleranceParamEl.innerHTML = `${formEl.tolerance.value} m`;
  detourMaxParamEl.innerHTML = `${formEl.maxDetour.value} km`;
  missedDistanceEl.innerHTML = `${Math.round(results.accuracy.missedDistance / 100) / 10} km (soit ${Math.round(results.accuracy.offTrackRatio * 10000) / 100} %)`;
  perfTitleEl.innerHTML = `Distance de la trace parcourue pendant les ${results.kpi.rollingDuration} h les moins favorables`;
  perfEl.innerHTML = `${results.kpi.distance / 1000} km (à partir du km ${results.kpi.slowestSegmentStart.distance / 1000} de la trace de référence, soit après  ${msToHHMM(results.kpi.slowestSegmentStart.elapsedTime)} à ${Math.round(results.kpi.meanSpeed * 1000) / 1000} km/h de moyenne)`;
};

const launchComparison = (event) => {
  event.preventDefault();

  launchComparisonEl.classList.remove('btn-primary');
  launchComparisonEl.classList.add('btn-danger');

  // Get options from form inputs
  const options = {
    rollingDuration: parseInt(formEl.rollingDuration.value, 10), // in seconds
    trigger: parseInt(formEl.trigger.value, 10), // in meters - trigger must be less than tolerance
    tolerance: parseInt(formEl.tolerance.value, 10), // in meters
    maxDetour: parseInt(formEl.maxDetour.value, 10) * 1000, // in meters
    maxSegLength: parseInt(formEl.maxSegLength.value, 10), // in meters
  };

  try {
    compareTracksWorker.postMessage({
      refPoints: refData.points.flat(),
      challPoints: challData.points.flat(),
      options,
    });
  } catch (err) {
    alert(err.message);
  }
};

compareTracksWorker.onmessage = (event) => {
  const results = event.data;

  // Update DOM
  updateDom(results);

  // Update map
  displayTrack(map, 'missed', results.tracks.missedSegments, {
    'line-color': '#ff0000',
    'line-width': 6,
    'line-opacity': 0.7,
  });

  displayTrack(map, 'slowest', results.tracks.worst, {
    'line-color': '#ffffff',
    'line-width': 2,
    'line-opacity': 1,
  });

  // Generate the downloadable files
  gpxStrFull = generateFullGpxStr(results);
  downloadGpxEl.classList.remove('disabled');

  launchComparisonEl.classList.remove('btn-danger');
  launchComparisonEl.classList.add('btn-primary');
};

const downloadFile = () => {
  const blob = new Blob(
    [gpxStrFull],
    { type: 'text/plain;charset=utf-8' },
  );

  FileSaver.saveAs(blob, 'gpsvisualizerSynthesis.gpx');
};

const loadFiles = async (event, data) => {
  const {
    currentTarget,
    currentTarget: { files },
  } = event;

  if (files.length > 0) {
    data.files = files;
    const promises = Array.from(files).map((file) => file.text());
    const strs = await Promise.all(promises);

    try {
      data.points = parseGpx(strs);
    } catch (err) {
      alert(err.message);
      currentTarget.value = '';
      return;
    }
  } else {
    data.points = [];

    // Erase track
    if (map.getLayer(data.id)) {
      map.removeLayer(data.id);
    }
    if (map.getSource(data.id)) {
      map.removeSource(data.id);
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
    'line-color': data.color,
    'line-width': 4,
    'line-opacity': 0.7,
  };
  displayTrack(map, data.id, data.points, paint);
  geolibBounds[data.id] = updateBounds(map, geolibBounds, data.points);
  fitBounds(map, geolibBounds);

  if (data.id === 'ref') {
    refData.points = [...data.points.flat()];
  }
};

// ------ MAIN ------//
map.on('load', () => {
  refFileInputEl.addEventListener('change', (event) => loadFiles(event, refData));
  challFileInputEl.addEventListener('change', (event) => loadFiles(event, challData));
  formEl.addEventListener('submit', launchComparison);
  downloadGpxEl.addEventListener('click', downloadFile);
});
