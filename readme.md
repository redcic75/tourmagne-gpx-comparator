# How to use
## With node
- Add source gpx files in `data/gpx` folder
- Fill in user data in `scripts/indexNode.js`
- Run `node scripts/indexNode.js`
- Synthesis is logged in the console.
- A GPX file containing all missed points of reference track is added in `generated_files` folder

## In browser
- Run `browserify scripts/indexWeb.js -o scripts/bundle.js` to bundle javascript files
- Launch you local server
- Open `http://localhost:5500` in your web browser

## Good to know
You can create test GPX files and view generated GPX files with https://gpx.studio/l/fr/.

# To do
- Increase detourMax for 1st point
- Do not take into account segments between files or between <trkseg> in calculateClosest
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
