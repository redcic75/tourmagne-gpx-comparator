# How to use
## With node
- Add source gpx files in `gpx` folder
- Fill in user data in `indexNode.js`
- Run `node indexNode.js`
- Synthesis is logged in the console.
- A GPX file containing all missed points of reference track is added in `generated_files` folder

## In browser
- Run `browserify indexWeb.js -o bundle.js` to bundle javascript files
- Launch you local server
- Open `http://localhost:5500` in your web browser

## Good to know
You can create test GPX files and view generated GPX files with https://gpx.studio/l/fr/.
# To do
- Handle GPX with multiple tracks or multiple track segments
- Add performance indicator calculation (distance per 24 hours)
- Improve format of generated gpx so that it opens in any gpx reader
- Fit map to displayed tracks : https://docs.mapbox.com/mapbox-gl-js/example/zoomto-linestring/
- Choose initial center and zoom of map
- Mapbox API key ?
- In browser, add possibility to download missed points gpx
