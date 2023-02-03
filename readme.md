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
- Deal with case when challenger gpx does not have timestamps
- Performance indicator :
  - when the challenger is out of the reference track, time of the refpoint
  is taken from the closest point on the challenger track
  => It can  can give an advantage to the challenger, to be fixed
  - To be refactored
  - Display the slowest zone on the map
- Mapbox API key ?
- Handle GPX with multiple tracks or multiple track segments
- Display waiting message while loading big files or while comparing big files
