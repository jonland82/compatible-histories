/* Run with: node verify-model.cjs. No dependencies. */
'use strict';
const assert = require('assert');
const { generate, binaryEntropy } = require('./model.js');
const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);

const data = generate();
const repeated = generate();
assert.deepStrictEqual(data.ratio, repeated.ratio, 'Seeds must reproduce the full record.');
assert.notDeepStrictEqual(data.ratio, generate({ seed: 1830 }).ratio, 'New seeds must change the observations.');

// Check the observable directly against retained centroid histories, not a rendered projection.
for (const n of [1, 11, 239, data.N]) {
  let closestSquared = Infinity;
  for (let j = 1; j < data.K; j++) {
    let squared = 0;
    for (let t = 1; t <= n; t++) squared += (data.centroids[0][t] - data.centroids[j][t]) ** 2;
    close(data.squaredDistances[j][n], squared);
    closestSquared = Math.min(closestSquared, squared);
  }
  close(data.radius[n] ** 2, closestSquared);
  close(data.ratio[n], closestSquared / n);
  close(data.squaredDistances[data.nearest[n]][n], closestSquared);
}

for (let n = 1; n <= data.N; n++) {
  assert.ok(data.radius[n] >= data.radius[n - 1], 'Appending a coordinate cannot reduce the nearest radius.');
  assert.ok(Number.isFinite(data.entropyEstimate[n]));
  assert.ok(data.entropyEstimate[n] >= 0 && data.entropyEstimate[n] <= Math.LN2 + 1e-12);
  for (let j = 0; j < data.K; j++) {
    close(data.centroids[j][n] * data.m, Math.round(data.centroids[j][n] * data.m));
  }
}

// Changing coordinate units rescales squared distances, but preserves inferred entropy.
const scaled = generate({ a: 3 });
for (const n of [1, 239, data.N]) {
  close(scaled.ratio[n], data.ratio[n] * 9);
  close(scaled.entropyEstimate[n], data.entropyEstimate[n]);
}
close(binaryEntropy(0), 0);
close(binaryEntropy(1), 0);
close(binaryEntropy(0.5), Math.LN2);
close(binaryEntropy(0.3), binaryEntropy(0.7));
assert.throws(() => generate({ K: 1 }), RangeError);

// A longer, unmodified record provides a numerical check of the asymptotic prediction.
const longRecord = generate({ N: 50000 });
assert.ok(Math.abs(longRecord.ratio[longRecord.N] / longRecord.r - 1) < 0.03);
assert.ok(Math.abs(longRecord.entropyEstimate[longRecord.N] - longRecord.h) < 0.015);
console.log('Model checks passed: exact history distances, nearest radius, reproducibility, scale invariance, entropy bounds, and long-record convergence.');
console.log(JSON.stringify({ defaultCoordinates: data.N, predicted: data.r, measured: data.ratio[data.N], estimatedEntropy: data.entropyEstimate[data.N], trueEntropy: data.h, longRecordRatio: longRecord.ratio[longRecord.N] }, null, 2));
