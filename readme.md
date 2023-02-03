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
- Performance indicator : now gives the time of track leaving to all points above tolerance
=> velocity is infinite on these segments => can give an advantage to the challenger => to be smoothened
- Refacto performance indicator calculation (distance per 24 hours)
- Mapbox API key ?
- Handle GPX with multiple tracks or multiple track segments
- Display waiting message while loading big files or while comparing big files
