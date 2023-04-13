/* eslint-disable no-unused-vars */

const Mocha = require('mocha');
const should = require('chai').should();

const fs = require('fs/promises');
const path = require('path');

const parseGpx = require('../scripts/services/parseGpx');
const compareTracks = require('../scripts/services/compareTracks');
const getGpxStrs = require('../scripts/services/getGpxStrs');

const fileToPoints = async (refFiles, challFiles) => {
  const prefix = path.resolve(__dirname, '../data/gpx/');

  const refPaths = refFiles.map((refFile) => `${prefix}/${refFile}.gpx`);
  const challPaths = challFiles.map((challFile) => `${prefix}/${challFile}.gpx`);


  const refGpxStrs = await getGpxStrs(refPaths);
  const challGpxStrs = await getGpxStrs(challPaths);

  // Parse GPX strings to JS objects
  const refPoints = parseGpx(refGpxStrs);
  const challPoints = parseGpx(challGpxStrs);

  return {
    refPoints,
    challPoints,
  };
};

Mocha.describe('compareTracks', function desc() {
  this.timeout(15000);
  let result;

  Mocha.describe('with Orleans loop', () => {
    Mocha.before(async () => {
      const refFiles = ['orleans-loop-trace'];
      const challFiles = ['orleans-loop-real'];

      const options = {
        rollingDuration: 1, // in hours
        trigger: 20, // in meters - trigger must be less than tolerance
        tolerance: 100, // in meters
        maxDetour: 20000, // in meters
      };

      const {
        refPoints,
        challPoints,
      } = await fileToPoints(refFiles, challFiles);

      result = await compareTracks(refPoints, challPoints, options);
    });

    Mocha.it('should return number of missed segments', async () => {
      result.missedSegments.length.should.equal(8);
    });

    Mocha.it('should return ref path distance', async () => {
      result.accuracy.refDistance.should.equal(55677);
    });

    Mocha.it('should return missed segments total distance', async () => {
      result.accuracy.missedDistance.should.equal(17642);
    });

    Mocha.it('should return slowest segment start index', async () => {
      result.kpi.slowestSegmentStart.index.should.equal(342);
    });

    Mocha.it('should return slowest segment end index', async () => {
      result.kpi.slowestSegmentEnd.index.should.equal(683);
    });

    Mocha.it('should return slowest segment distance', async () => {
      result.kpi.distance.should.equal(11118);
    });
  });

  Mocha.describe('with Orleans loop containing 3 <trkseg>', () => {
    Mocha.before(async () => {
      const refFiles = ['orleans-loop-trace'];
      const challFiles = ['orleans-loop-real-3-trkseg'];

      const options = {
        rollingDuration: 1, // in hours
        trigger: 20, // in meters - trigger must be less than tolerance
        tolerance: 100, // in meters
        maxDetour: 20000, // in meters
      };

      const {
        refPoints,
        challPoints,
      } = await fileToPoints(refFiles, challFiles);

      result = await compareTracks(refPoints, challPoints, options);
    });

    Mocha.it('should return number of missed segments', async () => {
      result.missedSegments.length.should.equal(8);
    });

    Mocha.it('should return ref path distance', async () => {
      result.accuracy.refDistance.should.equal(55677);
    });

    Mocha.it('should return missed segments total distance', async () => {
      result.accuracy.missedDistance.should.equal(17642);
    });

    Mocha.it('should return slowest segment start index', async () => {
      result.kpi.slowestSegmentStart.index.should.equal(342);
    });

    Mocha.it('should return slowest segment end index', async () => {
      result.kpi.slowestSegmentEnd.index.should.equal(683);
    });

    Mocha.it('should return slowest segment distance', async () => {
      result.kpi.distance.should.equal(11118);
    });
  });

  Mocha.describe('with Orleans loop split in 3 files', () => {
    Mocha.before(async () => {
      const refFiles = ['orleans-loop-trace'];
      const challFiles = ['orleans-loop-real-seg-1', 'orleans-loop-real-seg-3', 'orleans-loop-real-seg-2'];

      const options = {
        rollingDuration: 1, // in hours
        trigger: 20, // in meters - trigger must be less than tolerance
        tolerance: 100, // in meters
        maxDetour: 20000, // in meters
      };

      const {
        refPoints,
        challPoints,
      } = await fileToPoints(refFiles, challFiles);

      result = await compareTracks(refPoints, challPoints, options);
    });

    Mocha.it('should return number of missed segments', async () => {
      result.missedSegments.length.should.equal(8);
    });

    Mocha.it('should return ref path distance', async () => {
      result.accuracy.refDistance.should.equal(55677);
    });

    Mocha.it('should return missed segments total distance', async () => {
      result.accuracy.missedDistance.should.equal(17642);
    });

    Mocha.it('should return slowest segment start index', async () => {
      result.kpi.slowestSegmentStart.index.should.equal(342);
    });

    Mocha.it('should return slowest segment end index', async () => {
      result.kpi.slowestSegmentEnd.index.should.equal(683);
    });

    Mocha.it('should return slowest segment distance', async () => {
      result.kpi.distance.should.equal(11118);
    });
  });

  Mocha.describe('with Bordeaux - Paris', () => {
    Mocha.before(async () => {
      const refFiles = ['Bordeaux_Paris_2022_trace'];
      const challFiles = ['Bordeaux_Paris_2022_real'];

      const options = {
        rollingDuration: 1, // in hours
        trigger: 20, // in meters - trigger must be less than tolerance
        tolerance: 100, // in meters
        maxDetour: 20000, // in meters
      };

      const {
        refPoints,
        challPoints,
      } = await fileToPoints(refFiles, challFiles);

      result = await compareTracks(refPoints, challPoints, options);
    });

    Mocha.it('should return number of missed segments', async () => {
      result.missedSegments.length.should.equal(3);
    });

    Mocha.it('should return ref path distance', async () => {
      result.accuracy.refDistance.should.equal(659430);
    });

    Mocha.it('should return missed segments total distance', async () => {
      result.accuracy.missedDistance.should.equal(5944);
    });

    Mocha.it('should return slowest segment start index', async () => {
      result.kpi.slowestSegmentStart.index.should.equal(4115);
    });

    Mocha.it('should return slowest segment end index', async () => {
      result.kpi.slowestSegmentEnd.index.should.equal(4210);
    });

    Mocha.it('should return slowest segment distance', async () => {
      result.kpi.distance.should.equal(5553);
    });
  });
});
