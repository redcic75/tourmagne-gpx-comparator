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
- Check inputs:
  - challenger gpx does not have timestamps
  - Parameters coherence (tolerance < trigger, duration > durée du parcours du challenger)
- Handle multiple GPX files:
  - Auto sorting
  - Merge files ?
- Handle GPX with multiple tracks or multiple track segments

- Get rid of global variables in indexWeb.js ?
- Mapbox API key ?
- Display waiting message while loading big files or while comparing big files
