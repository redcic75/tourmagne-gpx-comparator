/* eslint-disable no-unused-vars */

const Mocha = require('mocha');
const should = require('chai').should();

const fs = require('fs/promises');
const path = require('path');

const compareGpx = require('../scripts/services/compareGpx');
const getGpxStr = require('../scripts/services/getGpxStr');

Mocha.describe('compareGpx', function desc() {
  this.timeout(15000);
  let result;

  Mocha.before(async () => {
    const refFile = 'orleans-loop-trace';
    const challFile = 'orleans-loop-real';

    const prefix = path.resolve(__dirname, '../data/gpx/');
    const refPath = `${prefix}/${refFile}.gpx`;
    const challPath = `${prefix}/${challFile}.gpx`;

    const options = {
      rollingDuration: 1, // in hours
      trigger: 20, // in meters - trigger must be less than tolerance
      tolerance: 100, // in meters
      maxDetour: 20000, // in meters
    };

    const userInputs = {
      refPath,
      challPath,
      options,
    };

    const [refGpxStr, challGpxStr] = await getGpxStr(refPath, challPath);

    const inputs = {
      ...userInputs,
      refGpxStr,
      challGpxStr,
    };

    result = await compareGpx(inputs);
  });

  Mocha.it('should return ref file path', async () => {
    result.inputs.refPath.should.equal('/home/redcic/code/redcic75/tourmagne-gpx-comparator/data/gpx/orleans-loop-trace.gpx');
  });

  Mocha.it('should return challenger file path', async () => {
    result.inputs.challPath.should.equal('/home/redcic/code/redcic75/tourmagne-gpx-comparator/data/gpx/orleans-loop-real.gpx');
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
    result.kpi.slowestSegmentStart.index.should.equal(202);
  });

  Mocha.it('should return slowest segment end index', async () => {
    result.kpi.slowestSegmentEnd.index.should.equal(386);
  });

  Mocha.it('should return slowest segment distance', async () => {
    result.kpi.distance.should.equal(15008);
  });
});
