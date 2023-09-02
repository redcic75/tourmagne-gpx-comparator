# How to use

## With node
- Add source gpx files in `data/gpx/evaluate-challenger/reference` and `data/gpx/evaluate-challenger/challenger` folder
- Run `node scripts/indexNode.js`
- Synthesis is logged in the console.
- A GPX file containing all missed points of reference track is added in `generated_files` folder

## In browser
- Run `webpack` or `npm run webpack` to bundle javascript files
- Use `webpack --mode=development` to avoid minification only in dev mode
- Launch you local server
- Open `http://localhost:5500` in your web browser

## Good to know
You can create test GPX files and view generated GPX files with https://gpx.studio/l/fr/.

# To do
- Reorganize gpx folder (do not forget gpx files needed for tests)
- Add an alert when calculus is in progress
- Add a progress bar
- Add a button to terminate the worker
- Add a mapbox key field (+ include it in the cookies)
- Check timestamps presence before calculating kpis
- Create personalized Error classes
- Separate frontend & backend
- Performance: 2 long methods (Orleans / Bdx-Paris examples):
  - parseGpx chall : 350 ms / 2300 ms
  - calculate closest: 7000 ms / 5000 ms
  - => Comes from external libs fast-xml-parser & calculateClosest (while loop executed 1_000_000 times)
- Mapbox API key
- Get rid of global variables in indexWeb.js ?
- Display waiting message while loading big files or while comparing big files
