const mapboxgl = require('mapbox-gl/dist/mapbox-gl');
const FileSaver = require('file-saver');

const parseGpx = require('./services/parseGpx');
const generateGpxStr = require('./services/generateGpxStr');
const compareTracks = require('./services/compareTracks');
const displayTrack = require('./mapHelpers/displayTrack');
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
const missedPercentEl = document.querySelector('#missedPercent');
const perfWhenEl = document.querySelector('#perfWhen');
const perfKmEl = document.querySelector('#perfKm');
const downloadGpxEl = document.querySelector('#downloadGpx');

let gpxStr = '';
const geolibBounds = {};
let refPoints;

// ------ HELPERS ------//
const updateDom = (results) => {
  refParamEl.innerHTML = refFileInputEl.files[0].name;
  challParamEl.innerHTML = Array.from(challFileInputEl.files).reduce((acc, file) => `${acc}${file.name}, `, '').slice(0, -2);

  durationParamEl.innerHTML = `${formEl.rollingDuration.value} h`;
  triggerParamEl.innerHTML = `${formEl.trigger.value} m`;
  toleranceParamEl.innerHTML = `${formEl.tolerance.value} m`;
  detourMaxParamEl.innerHTML = `${formEl.trigger.value} km`;
  missedDistanceEl.innerHTML = `${Math.round(results.accuracy.missedDistance)} m`;
  missedPercentEl.innerHTML = `${Math.round(results.accuracy.offTrackRatio * 1000) / 10} %`;
  perfKmEl.innerHTML = `Vitesse moyenne pendant les pires ${formEl.rollingDuration.value} h : ${Math.round(results.kpi.meanSpeed * 1000) / 1000} km/h`;
  perfWhenEl.innerHTML = `Période commencée après ${Math.round(results.kpi.slowestSegmentStart.elapsedTime / 3600) / 1000} h au km ${results.kpi.slowestSegmentStart.distance / 1000}`;
};

// ------ EVENT LISTENERS ------//
const launchComparison = async (event) => {
  event.preventDefault();

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
    results = await compareTracks(
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
  displayTrack(map, 'missed', results.missedSegments, paintMissed);

  const paintSlowest = {
    'line-color': '#ffffff',
    'line-width': 2,
    'line-opacity': 1,
  };
  displayTrack(map, 'slowest', [refPoints.slice(
    results.kpi.slowestSegmentStart.index,
    results.kpi.slowestSegmentEnd.index + 1,
  )], paintSlowest);

  // Generate the file containing the missed segments
  gpxStr = await generateGpxStr(results.missedSegments);
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
