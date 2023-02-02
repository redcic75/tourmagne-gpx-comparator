// Display a track
const displayTrack = (map, id, color, points) => {
    const data = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'LineString',
          'coordinates': [
            // [-0.565, 44.859]
          ]
        }
      }
    ]
  };

  if (!map.getSource(id)) {
    map.addSource(id, { type: 'geojson', data: data });
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
      },
    });
  }

  if (points) {
    points.forEach(point => {
      data.features[0].geometry.coordinates.push([point.lon, point.lat]);
    });
  } else {
    data.features[0].geometry.coordinates = [];
  }
  map.getSource(id).setData(data);
}

module.exports = displayTrack;
