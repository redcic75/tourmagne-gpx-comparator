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
- Deal with case where challenger gpx does not have timestamps
- Deal with case where parameters are not coherent (tolerance < trigger, duration > durée du parcours du challenger)
- Performance indicator :
  - when the challenger is out of the reference track, time of the refpoint
  is taken from the closest point on the challenger track
  => It can  can give an advantage to the challenger, to be fixed
  => Only take into account km of the reference track where the challenger was on track.
  - To be refactored
  - Get rid of `break` and `continue` ?
- Get rid of global variables in indexWeb.js
- Mapbox API key ?
- Handle GPX with multiple tracks or multiple track segments + handle multiple GPX files (with auto sorting)
- MBR: inclure la fusion des GPX réalisés pour le cas (général ?) où le challenger renvoie plusieurs fichiers GPX ?
- Display waiting message while loading big files or while comparing big files
