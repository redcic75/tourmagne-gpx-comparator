require('dotenv').config();
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
  missedDistanceEl.innerHTML = `${Math.round(missedDistance)} m`;
  missedPercentEl.innerHTML = `${Math.round(missedDistance / refDistance * 1000) / 10} %`;
};

// load files
const loadFile = async (evt) => {
  const currentTarget = evt.currentTarget;
  const file = evt.currentTarget.files[0];
  const id = evt.currentTarget.id;
  console.log(id)
  const color = evt.currentTarget.color;

  const str = await file.text();
  currentTarget.points = parseGpx(str);

  const data = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'LineString',
          'coordinates': [
            // [-0.565, 44.859]
          ]
        }
      }
    ]
  };

  map.addSource(id, { type: 'geojson', data: data });

  currentTarget.points.forEach(point => {
    data.features[0].geometry.coordinates.push([point.lon, point.lat]);
  });

  map.getSource(id).setData(data);
  map.addLayer({
    id: id,
    type: 'line',
    source: id,
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': color,
      'line-width': 4,
    },
  });
}

// Display empty map
mapboxgl.accessToken = process.env.MAPBOX_API_KEY;
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-0.6, 44.83],
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
