/* eslint-disable no-alert */
const maplibregl = require('maplibre-gl');
const FileSaver = require('file-saver');
const generateFullGpxStr = require('./services/generateFullGpxStr');
const displayTrack = require('./map_helpers/displayTrack');
const { updateBounds, fitBounds } = require('./map_helpers/updateBounds');
const datePlusDurationToStr = require('./helper/datePlusDurationToStr');

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
const messageEl = document.querySelector('#message');
let progressEl;

// ------ GLOBAL VARIABLES ------////
const tracks = {
  ref: { id: 'ref', color: '#0000ff' },
  chall: { id: 'chall', color: '#009100' },
};
const geolibBounds = {};
let fullGpxStr = '';

const style = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap Contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm', // This must match the source key above
    },
  ],
};

const map = new maplibregl.Map({
  container: 'map',
  style,
  center: [3.11, 46.42], // Display Melun - Nîmes zone
  zoom: 6,
});

map.addControl(new maplibregl.NavigationControl());

// ------ WORKERS ------////
const compareTracksWorker = new Worker(new URL('./workers/compareTracks', import.meta.url));
const parseGpxWorker = new Worker(new URL('./workers/parseGpx', import.meta.url));

// ------ METHODS ------//
const updateDom = (results) => {
  refParamEl.innerHTML = tracks.ref.files[0].name;
  challParamEl.innerHTML = Array.from(tracks.chall.files).reduce((acc, file) => `${acc}${file.name}, `, '').slice(0, -2);

  durationParamEl.innerHTML = `${formEl.rollingDuration.value} h`;
  triggerParamEl.innerHTML = `${formEl.trigger.value} m`;
  toleranceParamEl.innerHTML = `${formEl.tolerance.value} m`;
  detourMaxParamEl.innerHTML = `${formEl.maxDetour.value} km`;
  missedDistanceEl.innerHTML = `${Math.round(results.accuracy.missedDistance / 100) / 10} km (soit ${Math.round(results.accuracy.offTrackRatio * 10000) / 100} % de la trace de référence)`;
  perfTitleEl.innerHTML = `Distance de la trace parcourue pendant les ${results.kpi.rollingDuration} heures les moins favorables`;

  const {
    dateStr,
    timeStr,
  } = datePlusDurationToStr(
    new Date(results.tracks.chall[0][0].time),
    results.kpi.slowestSegmentStart.elapsedTime,
    'fr-FR',
  );

  perfEl.innerHTML = `${results.kpi.distance / 1000} km (à partir du ${dateStr} à ${timeStr}, au km ${results.kpi.slowestSegmentStart.distance / 1000} de la trace de référence à ${Math.round(results.kpi.meanSpeed * 1000) / 1000} km/h de moyenne)`;
};

const workerInProgress = (message) => {
  launchComparisonEl.disabled = true;
  refFileInputEl.disabled = true;
  challFileInputEl.disabled = true;
  downloadGpxEl.disabled = true;
  messageEl.innerHTML = message;
  messageEl.classList.toggle('d-none');

  // Only used during compareTracks execution for displaying progress
  progressEl = document.querySelector('#progress');
};

const workerDone = () => {
  launchComparisonEl.disabled = false;
  refFileInputEl.disabled = false;
  challFileInputEl.disabled = false;
  messageEl.innerText = '';
  messageEl.classList.toggle('d-none');
};

const launchComparison = (event) => {
  event.preventDefault();
  workerInProgress('Calcul en cours : <span id="progress">0.00</span> %');

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
      refPoints: tracks.ref.points.flat(),
      challPoints: tracks.chall.points.flat(),
      options,
    });
  } catch (err) {
    alert(err.message);
  }
};

compareTracksWorker.onmessage = (event) => {
  const {
    data: {
      name,
      results,
      progress,
    },
  } = event;

  if (name === 'progress') {
    progressEl.innerText = progress;
  } else if (name === 'results') {
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
    fullGpxStr = generateFullGpxStr(results);

    workerDone();
    downloadGpxEl.disabled = false;
  }
};

compareTracksWorker.onerror = (event) => {
  // eslint-disable-next-line no-console
  console.log(event);
  alert(`Erreur lors de la comparaison des traces\n${event.message}`);
  workerDone();
};

const downloadFile = () => {
  const blob = new Blob(
    [fullGpxStr],
    { type: 'text/plain;charset=utf-8' },
  );

  FileSaver.saveAs(blob, 'gpsvisualizerSynthesis.gpx');
};

const loadFiles = async (event, id) => {
  const {
    currentTarget,
    currentTarget: { files },
  } = event;

  if (files.length > 0) {
    tracks[id].files = files;
    const promises = Array.from(files).map((file) => file.text());
    const strs = await Promise.all(promises);

    try {
      workerInProgress('Chargement des fichiers en cours...');
      parseGpxWorker.postMessage({ id, strs });
    } catch (err) {
      alert(err.message);
      currentTarget.value = '';
      return;
    }
  } else {
    tracks[id].points = [];

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
};

parseGpxWorker.onmessage = (event) => {
  const {
    data: {
      id,
      result,
    },
  } = event;

  tracks[id].points = result;

  // Display track and update bounds
  displayTrack(map, id, tracks[id].points, {
    'line-color': tracks[id].color,
    'line-width': 4,
    'line-opacity': 0.7,
  });
  geolibBounds[id] = updateBounds(map, geolibBounds, tracks[id].points);
  fitBounds(map, geolibBounds);

  workerDone();
};

parseGpxWorker.onerror = (event) => {
  // eslint-disable-next-line no-console
  console.log(event);
  alert(`Erreur lors du chargement de la trace\n${event.message}`);
  workerDone();
};

// ------ MAIN ------//
map.on('load', () => {
  refFileInputEl.addEventListener('change', (event) => loadFiles(event, 'ref'));
  challFileInputEl.addEventListener('change', (event) => loadFiles(event, 'chall'));
  formEl.addEventListener('submit', launchComparison);
  downloadGpxEl.addEventListener('click', downloadFile);
});
