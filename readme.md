# How to use

## With node
- Add source gpx files in `data/inputs/reference_track` and `data/inputs/challenger_tracks` folders
- Run `npm run node`
- Synthesis is logged in the console.
- The gpx file containing all missed points of reference track is added in `data/output` folder

## In browser
- Run `webpack` or `npm run webpack` to bundle javascript files
- Launch you local server
- Open `http://localhost:5500` in your web browser

## Good to know
You can create test GPX files and view generated GPX files with https://gpx.studio/l/fr/.

# For devs only
## Dev mode
- Use `webpack --mode=development` to avoid minification only in dev mode
- Launch all tests with `npm run test`

## Performance info
2 long methods (respectively with orleans-loop & Bordeaux_Paris examples):
  - parseGpx chall : 350 ms / 2300 ms
  - calculate closest: 7000 ms / 5000 ms
  - => Comes from external libs fast-xml-parser & calculateClosest (while loop executed 1_000_000 times)

## To do
- Use https://leafletjs.com/ or https://github.com/maplibre/maplibre-gl-js instead of Mapbox
- Use .env for Mapbox token in Node version
- Add a mapbox accessToken field
- Use cookies for Mapbox token in browser version
- Add a button to stop the workers
- Check timestamps presence before calculating kpis
- Create personalized Error classes
- Make the form smaller / separate configuration parameters (add possibility to hide them ?) from other parameters
- gitignore dist folder and use CI to build
- Get rid of global variables in indexWeb.js ?
