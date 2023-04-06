const parseGpxStr = require('./helpers/parseGpx');

class GpxComparator {
  constructor(ref, chall, options) {
    this.refFilepath = ref.filepath;
    this.challFilepath = ref.filepath;
    this.refGpxStr = ref.gpxStr;
    this.challGpxStr = chall.gpxStr;
    this.options = options;
  }

  compare() {
    this.refPoints = parseGpxStr(this.refGpxStr);
    this.challPoints = parseGpxStr(this.challGpxStr);

    this.extendWithClosestChallPoints();
    this.extendWithMissedSegNb();

    // END
    this.perf = 1200;
  }

  extendWithClosestChallPoints() {
    this.refPointsExtended = [{}];
  }

  extendWithMissedSegNb() {
    this.refPointsExtended = [{}];
  }

  generateMissedSegments() {
    
  }
}

module.exports = GpxComparator;
