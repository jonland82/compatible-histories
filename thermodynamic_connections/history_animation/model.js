/* Independent binary constituents; all distances use the complete history. */
(function (root) {
  'use strict';
  function binaryEntropy(p) {
    if (p <= 0 || p >= 1) return 0;
    return -p * Math.log(p) - (1 - p) * Math.log(1 - p);
  }
  function randomGenerator(seed) {
    let state = seed >>> 0;
    return function () {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }
  function generate({ K = 8, m = 24, p = 0.3, a = 1, N = 2400, seed = 1829 } = {}) {
    if (!Number.isInteger(K) || K < 2 || !Number.isInteger(m) || m < 1 ||
        !Number.isInteger(N) || N < 1 || !(p > 0 && p < 1) || !(a > 0)) {
      throw new RangeError('Use K >= 2, m >= 1, N >= 1, 0 < p < 1, and a > 0.');
    }
    const random = randomGenerator(seed);
    const centroids = Array.from({ length: K }, () => new Float64Array(N + 1));
    const squaredDistances = Array.from({ length: K }, () => new Float64Array(N + 1));
    const nearest = new Uint16Array(N + 1);
    const radius = new Float64Array(N + 1);
    const ratio = new Float64Array(N + 1);
    const entropyEstimate = new Float64Array(N + 1);
    const r = 2 * a * a * p * (1 - p) / m;
    const h = binaryEntropy(p);
    for (let n = 1; n <= N; n++) {
      for (let i = 0; i < K; i++) {
        let ones = 0;
        for (let constituent = 0; constituent < m; constituent++) {
          if (random() < p) ones++;
        }
        centroids[i][n] = a * ones / m;
      }
      let minimum = Infinity;
      for (let j = 1; j < K; j++) {
        const difference = centroids[0][n] - centroids[j][n];
        const distance = squaredDistances[j][n - 1] + difference * difference;
        squaredDistances[j][n] = distance;
        if (distance < minimum) {
          minimum = distance;
          nearest[n] = j;
        }
      }
      radius[n] = Math.sqrt(minimum);
      ratio[n] = minimum / n;
      const clipped = Math.min(a * a / (2 * m), ratio[n]);
      const inferredP = (1 - Math.sqrt(Math.max(0, 1 - 2 * m * clipped / (a * a)))) / 2;
      entropyEstimate[n] = binaryEntropy(inferredP);
    }
    return { K, m, p, a, N, seed, r, h, centroids, squaredDistances, nearest, radius, ratio, entropyEstimate };
  }
  const api = { generate, binaryEntropy };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ClusterHistoryModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
