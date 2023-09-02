# How to use

## With node
- Add source gpx files in `data/gpx/evaluate-challenger/reference` and `data/gpx/evaluate-challenger/challenger` folder
- Run `node scripts/indexNode.js`
- Synthesis is logged in the console.
- A GPX file containing all missed points of reference track is added in `generated_files` folder

## In browser
- Run `npm run browserify` to bundle javascript files
- Launch you local server
- Open `http://localhost:5500` in your web browser

## Good to know
You can create test GPX files and view generated GPX files with https://gpx.studio/l/fr/.

# To do
- Use modules (import & export) and stop using browserify -> Other Node.JS method used ?
- Use workers
- Add a button to terminate the worker
- Add a mapbox key field (+ include it in the cookies)
- Regorganize gpx folder
- Change button color when calculus is launched to notify the user
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
