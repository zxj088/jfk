import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

await import('../landlord-scoring.js');
const { compareLandlordWithBestPeasants } = globalThis.SIMPLE_GOLF_LANDLORD_SCORING;

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const teamNumberSource = app.match(/function teamNumber\(scores, par, shouldFlip\) \{[\s\S]*?\n\}/)?.[0];
assert.ok(teamNumberSource);
const vegasContext = {};
vm.runInNewContext(`${teamNumberSource}; this.teamNumber = teamNumber;`, vegasContext);

function vegasHole(gross, par = 4) {
  const aUnderPar = Math.min(gross[0], gross[1]) < par;
  const bUnderPar = Math.min(gross[2], gross[3]) < par;
  const aNumber = vegasContext.teamNumber(gross.slice(0, 2), par, bUnderPar && !aUnderPar);
  const bNumber = vegasContext.teamNumber(gross.slice(2, 4), par, aUnderPar && !bUnderPar);
  const delta = bNumber.value - aNumber.value;
  const originalDelta = bNumber.originalValue - aNumber.originalValue;
  return {
    delta,
    flipped: aNumber.flipped || bNumber.flipped,
    flipExtra: Math.abs(delta) - Math.abs(originalDelta),
    birdies: gross.filter(score => par - score === 1).length,
    eagles: gross.filter(score => score !== 1 && par - score >= 2).length,
    holesInOne: gross.filter(score => score === 1).length
  };
}

test('simulated four-player landlord match matches every analysis aggregate', () => {
  const holes = [
    { values: [4, 5, 6, 7], landlord: 0, multiplier: 1 },
    { values: [5, 4, 6, 7], landlord: 1, multiplier: 1 },
    { values: [4, 5, 6, 7], landlord: 2, multiplier: 1 },
    { values: [3, 5, 6, 7], landlord: 3, multiplier: 4 }
  ].map(hole => ({
    ...hole,
    result: compareLandlordWithBestPeasants({
      scoringValues: hole.values,
      landlordIndex: hole.landlord,
      bestPeasantCount: 2,
      multiplier: hole.multiplier
    })
  }));

  const totals = [0, 0, 0, 0];
  const role = Array.from({ length: 4 }, () => ({ landlordCount: 0, peasantCount: 0, landlordPoints: 0, peasantPoints: 0 }));
  holes.forEach(hole => hole.result.points.forEach((points, player) => {
    totals[player] += points;
    if (player === hole.landlord) {
      role[player].landlordCount += 1;
      role[player].landlordPoints += points;
    } else {
      role[player].peasantCount += 1;
      role[player].peasantPoints += points;
    }
  }));
  const maxHoles = totals.map((_, player) => {
    const magnitudes = holes.map(hole => Math.abs(hole.result.points[player]));
    const max = Math.max(...magnitudes);
    return magnitudes.flatMap((value, index) => value === max ? [index + 1] : []);
  });

  assert.deepEqual(totals, [7, 7, -1, -13]);
  assert.equal(totals.reduce((sum, value) => sum + value, 0), 0);
  assert.deepEqual(role, [
    { landlordCount: 1, peasantCount: 3, landlordPoints: 3, peasantPoints: 4 },
    { landlordCount: 1, peasantCount: 3, landlordPoints: 3, peasantPoints: 4 },
    { landlordCount: 1, peasantCount: 3, landlordPoints: -3, peasantPoints: 2 },
    { landlordCount: 1, peasantCount: 3, landlordPoints: -12, peasantPoints: -1 }
  ]);
  assert.deepEqual(maxHoles, [[4], [4], [4], [4]]);
  assert.deepEqual(holes.filter(hole => hole.multiplier > 1).map(hole => [holes.indexOf(hole) + 1, hole.multiplier]), [[4, 4]]);
  assert.equal(holes.flatMap(hole => hole.values).filter((score, index) => 4 - score === 1).length, 1);
});

test('simulated Las Vegas match matches flips, tied biggest holes and special-score totals', () => {
  const holes = [
    vegasHole([4, 5, 5, 7]),
    vegasHole([5, 7, 3, 6]),
    vegasHole([3, 6, 3, 7]),
    vegasHole([5, 7, 3, 6])
  ];
  const teamA = holes.reduce((sum, hole) => sum + hole.delta, 0);
  const teamB = -teamA;
  const flipped = holes.flatMap((hole, index) => hole.flipped ? [{ hole: index + 1, extra: hole.flipExtra }] : []);
  const maxMagnitude = Math.max(...holes.map(hole => Math.abs(hole.delta)));
  const biggestHoles = holes.flatMap((hole, index) => Math.abs(hole.delta) === maxMagnitude ? [index + 1] : []);

  assert.deepEqual([teamA, teamB], [-65, 65]);
  assert.equal(teamA + teamB, 0);
  assert.deepEqual(flipped, [{ hole: 2, extra: 18 }, { hole: 4, extra: 18 }]);
  assert.equal(flipped.reduce((sum, item) => sum + item.extra, 0), 36);
  assert.deepEqual(biggestHoles, [2, 4]);
  assert.deepEqual({
    birdies: holes.reduce((sum, hole) => sum + hole.birdies, 0),
    eagles: holes.reduce((sum, hole) => sum + hole.eagles, 0),
    holesInOne: holes.reduce((sum, hole) => sum + hole.holesInOne, 0)
  }, { birdies: 4, eagles: 0, holesInOne: 0 });
});
