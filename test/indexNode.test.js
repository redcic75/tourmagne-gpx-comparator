/* eslint-disable no-unused-vars */

const Mocha = require('mocha');
const should = require('chai').should();

const fs = require('fs/promises');
const path = require('path');

const compareGpx = require('../scripts/services/compareGpx');
const getGpxStr = require('../scripts/services/getGpxStr');

Mocha.describe('compareGpx', () => {
  Mocha.it('should return full analysis', async () => {
    const refFile = 'orleans-loop-trace';
    const challFile = 'orleans-loop-real';

    const prefix = path.resolve(__dirname, '../data/gpx/');
    const refPath = `${prefix}/${refFile}.gpx`;
    const challPath = `${prefix}/${challFile}.gpx`;

    const options = {
      duration: 1, // in hours
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

    const result = await compareGpx(inputs);

    result.inputs.refPath.should.equal('/home/redcic/code/redcic75/tourmagne-gpx-comparator/data/gpx/orleans-loop-trace.gpx');
    result.inputs.challPath.should.equal('/home/redcic/code/redcic75/tourmagne-gpx-comparator/data/gpx/orleans-loop-real.gpx');
    result.accuracy.refDistance.should.equal(55677);
    result.accuracy.missedDistance.should.equal(17642);
    result.kpi.rollingDurationMinDistance.should.equal(15726);
    result.kpi.rollingDurationStartIndex.should.equal(110);
    result.kpi.rollingDurationEndIndex.should.equal(314);
    result.missedSegments.length.should.equal(8);
  }).timeout(8000);
});
