You can create test GPX files and view generated missed-xxx.gpx files with https://gpx.studio/l/fr/.

To work in browser, launch : `browserify main.js -o bundle.js`

TODO :
- Handle GPX with multiple tracks or multiple track segments
- Add a trigger distance in addition to the tolerance distance
- Add performance indicator calculation (distance per 24 hours)
- Improve format of generated gpx so that it opens in any gpx reader
- In browser :
  - Add map
  - Add input for tolerance & trigger
  - Add possibility to download missed points gpx
