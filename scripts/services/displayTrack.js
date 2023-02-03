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

  segments.forEach((points, index) => {
    points.forEach(point => {
      data.features[index].geometry.coordinates.push([point.lon, point.lat]);
    });
  });

  map.getSource(id).setData(data);
}

module.exports = displayTrack;
