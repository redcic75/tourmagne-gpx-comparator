/* eslint-disable no-unused-vars */

const Mocha = require('mocha');
const should = require('chai').should();

const fs = require('fs/promises');
const path = require('path');

const compareGpx = require('../scripts/services/compareGpx');
const parseGpx = require('../scripts/services/parseGpx');

Mocha.describe('indexNode', () => {
  Mocha.it('should return full analysis', async () => {
    const refFile = 'orleans-loop-trace';
    const challFile = 'orleans-loop-real';

    const prefix = path.resolve(__dirname, '../data/gpx/');
    const refPath = `${prefix}/${refFile}.gpx`;
    const challPath = `${prefix}/${challFile}.gpx`;

    // Load files -> strings
    const refPromise = fs.readFile(refPath, { encoding: 'utf8' });
    const challPromise = fs.readFile(challPath, { encoding: 'utf8' });
    const [refStr, challStr] = await Promise.all([refPromise, challPromise]);

    // Parse strings to JS objects
    const refPoints = parseGpx(refStr);
    const challPoints = parseGpx(challStr);

    const options = {
      duration: 1, // in hours
      trigger: 20, // in meters - trigger must be less than tolerance
      tolerance: 100, // in meters
      maxDetour: 20000, // in meters
    };

    const result = await compareGpx(refPoints, challPoints, options);

    result.missedDistance.should.equal(17642);
    result.missedSegmentsOffTolerance.length.should.equal(8);
    result.passageTimes.length.should.equal(789);
    result.refDistance.should.equal(55677);
    result.perf.should.deep.equal({
      distance: 15726,
      endRefIndex: 314,
      speed: 18764.865760689427,
      startRefIndex: 110,
    });
    result.refDistance.should.equal(55677);
  }).timeout(8000);
});
