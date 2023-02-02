const { XMLParser} = require('fast-xml-parser');
const calculate = require('./calculate');

const parser = new XMLParser({
  ignoreAttributes : false,
  parseAttributeValue: true,
  attributeNamePrefix : '',
});

// Links with HTML file
const refFileInputEl = document.querySelector('#ref');
const challFileInputEl = document.querySelector('#chall');
const buttonEl = document.querySelector('#calculateBtn');
const progressEl = document.querySelector('#progress');
const missedDistanceEl = document.querySelector('#missedDistance');
const missedPercentEl = document.querySelector('#missedPercent');

// Params
const options = {
  trigger: 20, // in meters - trigger must be less than tolerance
  tolerance: 100, // in meters
  maxDetour: 20000, // in meters
};


const launchComparison = async () => {
  progressEl.innerHTML = 'Comparaison en cours';
  const {
    missedSegmentsOffTolerance,
    refDistance,
    missedDistance,
  } = await calculate(
    refFileInputEl.points,
    challFileInputEl.points,
    options,
  );

  progressEl.innerHTML = 'Comparaison terminée';
  missedDistanceEl.innerHTML = `Missed distance of the reference path: ${Math.round(missedDistance)} m`;
  missedPercentEl.innerHTML = `Missed % of the reference path: ${Math.round(missedDistance / refDistance * 1000) / 10} %`
};

// load files
const loadFile = async (evt) => {
  const currentTarget = evt.currentTarget;
  const file = evt.currentTarget.files[0];
  const str = await file.text();
  const gpx = parser.parse(str);
  currentTarget.points = gpx.gpx.trk.trkseg.trkpt;
}

// Event listeners
refFileInputEl.addEventListener('change', loadFile);
challFileInputEl.addEventListener('change', loadFile);
buttonEl.addEventListener('click', launchComparison);
