const chai = require('chai');

const { expect } = chai;

const path = require('path');

const parseGpx = require('../scripts/workers/parseGpx');
const compareTracks = require('../scripts/workers/compareTracks');
const getGpxStrs = require('../scripts/services/getGpxStrs');

const fileToPoints = async (refFiles, challFiles) => {
  const prefix = path.resolve(__dirname, './fixtures');

  const refPaths = refFiles.map((refFile) => `${prefix}/${refFile}.gpx`);
  const challPaths = challFiles.map((challFile) => `${prefix}/${challFile}.gpx`);

  const refGpxStrs = await getGpxStrs(refPaths);
  const challGpxStrs = await getGpxStrs(challPaths);

  // Parse GPX strings to JS objects
  const refPoints = parseGpx(refGpxStrs).flat();
  const challPoints = parseGpx(challGpxStrs).flat();

  return {
    refPoints,
    challPoints,
  };
};

describe('compareTracks', function desc() {
  this.timeout(15000);
  let result;

  context('with Orleans loop', () => {
    before(async () => {
      const refFiles = ['orleans-loop-trace'];
      const challFiles = ['orleans-loop-real'];

      const options = {
        rollingDuration: 1, // in hours
        trigger: 20, // in meters - trigger must be less than tolerance
        tolerance: 100, // in meters
        maxDetour: 20000, // in meters
        maxSegLength: 200, // in meters
      };

      const {
        refPoints,
        challPoints,
      } = await fileToPoints(refFiles, challFiles);

      result = compareTracks(refPoints, challPoints, options);
    });

    it('should return number of missed segments', async () => {
      expect(result.tracks.missedSegments.length).to.equal(8);
    });

    it('should return ref path distance', async () => {
      expect(result.accuracy.refDistance).to.equal(55677);
    });

    it('should return missed segments total distance', async () => {
      expect(result.accuracy.missedDistance).to.equal(17642);
    });

    it('should return slowest segment start index', async () => {
      expect(result.kpi.slowestSegmentStart.index).to.equal(342);
    });

    it('should return slowest segment end index', async () => {
      expect(result.kpi.slowestSegmentEnd.index).to.equal(683);
    });

    it('should return slowest segment distance', async () => {
      expect(result.kpi.distance).to.equal(11118);
    });
  });

  context('with Orleans loop containing 3 <trkseg>', () => {
    before(async () => {
      const refFiles = ['orleans-loop-trace'];
      const challFiles = ['orleans-loop-real-3-trkseg'];

      const options = {
        rollingDuration: 1, // in hours
        trigger: 20, // in meters - trigger must be less than tolerance
        tolerance: 100, // in meters
        maxDetour: 20000, // in meters
        maxSegLength: 200, // in meters
      };

      const {
        refPoints,
        challPoints,
      } = await fileToPoints(refFiles, challFiles);

      result = compareTracks(refPoints, challPoints, options);
    });

    it('should return number of missed segments', async () => {
      expect(result.tracks.missedSegments.length).to.equal(8);
    });

    it('should return ref path distance', async () => {
      expect(result.accuracy.refDistance).to.equal(55677);
    });

    it('should return missed segments total distance', async () => {
      expect(result.accuracy.missedDistance).to.equal(17642);
    });

    it('should return slowest segment start index', async () => {
      expect(result.kpi.slowestSegmentStart.index).to.equal(342);
    });

    it('should return slowest segment end index', async () => {
      expect(result.kpi.slowestSegmentEnd.index).to.equal(683);
    });

    it('should return slowest segment distance', async () => {
      expect(result.kpi.distance).to.equal(11118);
    });
  });

  context('with Orleans loop split in 3 files', () => {
    before(async () => {
      const refFiles = ['orleans-loop-trace'];
      const challFiles = ['orleans-loop-real-seg-1', 'orleans-loop-real-seg-3', 'orleans-loop-real-seg-2'];

      const options = {
        rollingDuration: 1, // in hours
        trigger: 20, // in meters - trigger must be less than tolerance
        tolerance: 100, // in meters
        maxDetour: 20000, // in meters
        maxSegLength: 200, // in meters
      };

      const {
        refPoints,
        challPoints,
      } = await fileToPoints(refFiles, challFiles);

      result = compareTracks(refPoints, challPoints, options);
    });

    it('should return number of missed segments', async () => {
      expect(result.tracks.missedSegments.length).to.equal(8);
    });

    it('should return ref path distance', async () => {
      expect(result.accuracy.refDistance).to.equal(55677);
    });

    it('should return missed segments total distance', async () => {
      expect(result.accuracy.missedDistance).to.equal(17642);
    });

    it('should return slowest segment start index', async () => {
      expect(result.kpi.slowestSegmentStart.index).to.equal(342);
    });

    it('should return slowest segment end index', async () => {
      expect(result.kpi.slowestSegmentEnd.index).to.equal(683);
    });

    it('should return slowest segment distance', async () => {
      expect(result.kpi.distance).to.equal(11118);
    });
  });

  context('with Bordeaux - Paris', () => {
    before(async () => {
      const refFiles = ['Bordeaux_Paris_2022_trace'];
      const challFiles = ['Bordeaux_Paris_2022_real'];

      const options = {
        rollingDuration: 1, // in hours
        trigger: 20, // in meters - trigger must be less than tolerance
        tolerance: 100, // in meters
        maxDetour: 20000, // in meters
        maxSegLength: 200, // in meters
      };

      const {
        refPoints,
        challPoints,
      } = await fileToPoints(refFiles, challFiles);

      result = compareTracks(refPoints, challPoints, options);
    });

    it('should return number of missed segments', async () => {
      expect(result.tracks.missedSegments.length).to.equal(4);
    });

    it('should return ref path distance', async () => {
      expect(result.accuracy.refDistance).to.equal(659430);
    });

    it('should return missed segments total distance', async () => {
      expect(result.accuracy.missedDistance).to.equal(6451);
    });

    it('should return slowest segment start index', async () => {
      expect(result.kpi.slowestSegmentStart.index).to.equal(4115);
    });

    it('should return slowest segment end index', async () => {
      expect(result.kpi.slowestSegmentEnd.index).to.equal(4210);
    });

    it('should return slowest segment distance', async () => {
      expect(result.kpi.distance).to.equal(5553);
    });
  });

  context('with Bordeaux - Paris with high maxSegLength (to fall back on old behaviour)', () => {
    before(async () => {
      const refFiles = ['Bordeaux_Paris_2022_trace'];
      const challFiles = ['Bordeaux_Paris_2022_real'];

      const options = {
        rollingDuration: 1, // in hours
        trigger: 20, // in meters - trigger must be less than tolerance
        tolerance: 100, // in meters
        maxDetour: 20000, // in meters
        maxSegLength: 2000, // in meters
      };

      const {
        refPoints,
        challPoints,
      } = await fileToPoints(refFiles, challFiles);

      result = compareTracks(refPoints, challPoints, options);
    });

    it('should return number of missed segments', async () => {
      expect(result.tracks.missedSegments.length).to.equal(3);
    });

    it('should return ref path distance', async () => {
      expect(result.accuracy.refDistance).to.equal(659430);
    });

    it('should return missed segments total distance', async () => {
      expect(result.accuracy.missedDistance).to.equal(5944);
    });

    it('should return slowest segment start index', async () => {
      expect(result.kpi.slowestSegmentStart.index).to.equal(4115);
    });

    it('should return slowest segment end index', async () => {
      expect(result.kpi.slowestSegmentEnd.index).to.equal(4210);
    });

    it('should return slowest segment distance', async () => {
      expect(result.kpi.distance).to.equal(5553);
    });
  });

  context('with incorrect options', () => {
    let options;
    let refPoints;
    let challPoints;

    before(async () => {
      const refFiles = ['orleans-loop-trace'];
      const challFiles = ['orleans-loop-real'];

      options = {
        rollingDuration: 1, // in hours
        trigger: 20, // in meters - trigger must be less than tolerance
        tolerance: 10, // in meters
        maxDetour: 20000, // in meters
        maxSegLength: 200, // in meters
      };

      ({
        refPoints,
        challPoints,
      } = await fileToPoints(refFiles, challFiles));
    });

    it('should throw when trigger > tolerance', () => {
      expect(() => compareTracks(refPoints, challPoints, options)).to.throw(Error, "tolérance d'écart");
    });
  });
});
