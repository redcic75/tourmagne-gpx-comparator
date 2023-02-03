const geolib = require('geolib');

// Helper functions
const min = (...args) => Math.min(...args.filter(Number.isFinite));

const max = (...args) => Math.max(...args.filter(Number.isFinite));

// Update bounds function
const updateBounds = (map, geolibBounds, segments) => {
  const geolibTrackBounds = {};

  segments.forEach((segment) => {
    if (segment.length) {
      const geolibSegmentBounds = geolib.getBounds(segment);

      geolibTrackBounds.minLat = min(geolibTrackBounds.minLat, geolibSegmentBounds.minLat);
      geolibTrackBounds.minLng = min(geolibTrackBounds.minLng, geolibSegmentBounds.minLng);
      geolibTrackBounds.maxLat = max(geolibTrackBounds.maxLat, geolibSegmentBounds.maxLat);
      geolibTrackBounds.maxLng = max(geolibTrackBounds.maxLng, geolibSegmentBounds.maxLng);
    }
  });

  return geolibTrackBounds;
};

const fitBounds = (map, geolibBounds) => {
  const bounds = {
    minLat: min(geolibBounds.ref?.minLat, geolibBounds.chall?.minLat),
    minLng: min(geolibBounds.ref?.minLng, geolibBounds.chall?.minLng),
    maxLat: max(geolibBounds.ref?.maxLat, geolibBounds.chall?.maxLat),
    maxLng: max(geolibBounds.ref?.maxLng, geolibBounds.chall?.maxLng),
  };

  map.fitBounds(
    [[bounds.minLng, bounds.minLat],
      [bounds.maxLng, bounds.maxLat]],
    {
      padding: 20,
    },
  );
};

module.exports = {
  updateBounds,
  fitBounds,
};
