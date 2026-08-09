import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const teamNumberSource = app.match(/function teamNumber\(scores, par, shouldFlip\) \{[\s\S]*?\n\}/)?.[0];
assert.ok(teamNumberSource, 'teamNumber must remain available');
const context = {};
vm.runInNewContext(`${teamNumberSource}; this.teamNumber = teamNumber;`, context);
const { teamNumber } = context;

function simulateVegasHole({ gross, net = gross, par = 4, scoreMode = 'gross', flipEnabled = true }) {
  const active = scoreMode === 'net' ? net : gross;
  const aUnderPar = Math.min(gross[0], gross[1]) < par;
  const bUnderPar = Math.min(gross[2], gross[3]) < par;
  const flipA = flipEnabled && bUnderPar && !aUnderPar;
  const flipB = flipEnabled && aUnderPar && !bUnderPar;
  const aNumber = teamNumber(active.slice(0, 2), par, flipA);
  const bNumber = teamNumber(active.slice(2, 4), par, flipB);
  const delta = bNumber.value - aNumber.value;
  return { aNumber, bNumber, delta, aPoints: delta, bPoints: -delta, aUnderPar, bUnderPar };
}

test('standard Las Vegas pairs use the lower stroke as the tens digit', () => {
  const result = simulateVegasHole({ gross: [4, 5, 5, 7] });
  assert.equal(result.aNumber.value, 45);
  assert.equal(result.bNumber.value, 57);
  assert.equal(result.aPoints, 12);
  assert.equal(result.bPoints, -12);
});

test('a one-sided birdie flips the losing opponent pair', () => {
  const result = simulateVegasHole({ gross: [5, 7, 3, 6], par: 4 });
  assert.equal(result.aNumber.value, 75);
  assert.equal(result.aNumber.flipped, true);
  assert.equal(result.bNumber.value, 36);
  assert.deepEqual([result.aPoints, result.bPoints], [-39, 39]);
});

test('both teams under par cancel the flip', () => {
  const result = simulateVegasHole({ gross: [3, 6, 3, 7], par: 4 });
  assert.equal(result.aNumber.flipped, false);
  assert.equal(result.bNumber.flipped, false);
  assert.deepEqual([result.aNumber.value, result.bNumber.value], [36, 37]);
  assert.deepEqual([result.aPoints, result.bPoints], [1, -1]);
});

test('disabling under-par flip retains the ordinary pair order', () => {
  const result = simulateVegasHole({ gross: [5, 7, 3, 6], par: 4, flipEnabled: false });
  assert.deepEqual([result.aNumber.value, result.bNumber.value], [57, 36]);
  assert.deepEqual([result.aPoints, result.bPoints], [-21, 21]);
});

test('net Las Vegas uses handicap-adjusted values but gross scores still trigger flips', () => {
  const result = simulateVegasHole({
    gross: [5, 6, 6, 7],
    net: [4, 6, 4, 7],
    scoreMode: 'net'
  });
  assert.deepEqual([result.aNumber.value, result.bNumber.value], [46, 47]);
  assert.deepEqual([result.aPoints, result.bPoints], [1, -1]);
  assert.equal(result.aUnderPar, false);
  assert.equal(result.bUnderPar, false);
});

test('a simulated multi-hole Las Vegas round is zero-sum', () => {
  const holes = [
    simulateVegasHole({ gross: [4, 5, 5, 7] }),
    simulateVegasHole({ gross: [5, 7, 3, 6], par: 4 }),
    simulateVegasHole({ gross: [3, 6, 3, 7], par: 4 })
  ];
  const totals = holes.reduce((sum, hole) => [sum[0] + hole.aPoints, sum[1] + hole.bPoints], [0, 0]);
  assert.deepEqual(totals, [-26, 26]);
  assert.equal(totals[0] + totals[1], 0);
});

test('app wiring uses gross under-par detection and opposite signed team totals', () => {
  assert.match(app, /const flipA = state\.underParFlip && bUnderPar && !aUnderPar/);
  assert.match(app, /const flipB = state\.underParFlip && aUnderPar && !bUnderPar/);
  assert.match(app, /sum\.a \+= result\.delta;\s*sum\.b -= result\.delta/);
});
