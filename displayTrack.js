const geolib = require('geolib');

// Display a track
const displayTrack = (map, id, color, segments) => {
  const features = []
  for (let i = 0; i < segments.length; i++) {
    features.push({
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'LineString',
        'coordinates': [],
      }
    });
  };

  const data = {
    'type': 'FeatureCollection',
    'features': features,
  };

  if (!map.getSource(id)) {
    map.addSource(id,
      {
        type: 'geojson',
        data: data,
      }
    );

    map.addLayer({
      id: id,
      type: 'line',
      source: id,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': color,
        'line-width': 4,
        'line-opacity': .7,
      },
    });
  }

  let geolibBounds = {};
  segments.forEach((points, index) => {
    points.forEach(point => {
      data.features[index].geometry.coordinates.push([point.lon, point.lat]);
    });
    // Update bounding box
    const geolibSegmentBounds = geolib.getBounds(points);
    console.log(geolibSegmentBounds);
    geolibBounds.minLat = Math.min(...[geolibBounds.minLat, geolibSegmentBounds.minLat].filter(Number.isFinite));
    geolibBounds.minLng = Math.min(...[geolibBounds.minLng, geolibSegmentBounds.minLng].filter(Number.isFinite));
    geolibBounds.maxLat = Math.max(...[geolibBounds.maxLat, geolibSegmentBounds.maxLat].filter(Number.isFinite));
    geolibBounds.maxLng = Math.max(...[geolibBounds.maxLng, geolibSegmentBounds.maxLng].filter(Number.isFinite));
  });

  map.getSource(id).setData(data);

  console.log(geolibBounds)

  return geolibBounds;
}

module.exports = displayTrack;
