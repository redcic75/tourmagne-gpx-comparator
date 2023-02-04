// Display a track
const displayTrack = (map, id, segments, paint) => {
  const features = [];
  for (let i = 0; i < segments.length; i += 1) {
    features.push({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
    });
  }

  const data = {
    type: 'FeatureCollection',
    features,
  };

  if (!map.getSource(id)) {
    map.addSource(
      id,
      {
        type: 'geojson',
        data,
      },
    );

    map.addLayer({
      id,
      type: 'line',
      source: id,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint,
    });
  }

  segments.forEach((points, index) => {
    points.forEach((point) => {
      data.features[index].geometry.coordinates.push([point.lon, point.lat]);
    });
  });

  map.getSource(id).setData(data);
};

module.exports = displayTrack;
