import assert from 'node:assert/strict';
import test from 'node:test';

await import('../landlord-scoring.js');

const { compareLandlordWithBestPeasants, resolveTieWinner } = globalThis.SIMPLE_GOLF_LANDLORD_SCORING;

test('landlord compares against the selected number of lowest Pack scores', () => {
  const result = compareLandlordWithBestPeasants({
    scoringValues: [5, 4, 6, 7],
    landlordIndex: 0,
    bestPeasantCount: 2
  });
  assert.deepEqual(result.selectedPeasantIndexes, [1, 2]);
  assert.equal(result.landlordTotal, 10);
  assert.equal(result.peasantsTotal, 10);
  assert.equal(result.tied, true);
});

test('one best Pack score can decide the result while every Pack player shares the points', () => {
  const result = compareLandlordWithBestPeasants({
    scoringValues: [5, 4, 8, 9],
    landlordIndex: 0,
    bestPeasantCount: 1,
    multiplier: 2
  });
  assert.equal(result.landlordWon, false);
  assert.deepEqual(result.points, [-6, 2, 2, 2]);
  assert.equal(result.points.reduce((sum, value) => sum + value, 0), 0);
});

test('best Pack count is clamped to the available number of Pack players', () => {
  const result = compareLandlordWithBestPeasants({
    scoringValues: [4, 5, 6],
    landlordIndex: 0,
    bestPeasantCount: 99
  });
  assert.equal(result.selectedCount, 2);
  assert.deepEqual(result.selectedPeasantIndexes, [1, 2]);
});

test('a configured landlord tie win awards the hole to the landlord', () => {
  const result = compareLandlordWithBestPeasants({
    scoringValues: [5, 5, 8],
    landlordIndex: 0,
    bestPeasantCount: 1,
    tieWinner: 'landlord',
    multiplier: 4
  });
  assert.equal(result.landlordWon, true);
  assert.equal(result.tied, false);
  assert.deepEqual(result.points, [8, -4, -4]);
});

test('a configured Pack tie win awards the hole to every Pack player', () => {
  const result = compareLandlordWithBestPeasants({
    scoringValues: [5, 5, 8],
    landlordIndex: 0,
    bestPeasantCount: 1,
    tieWinner: 'peasants',
    multiplier: 2
  });
  assert.equal(result.landlordWon, false);
  assert.equal(result.tied, false);
  assert.deepEqual(result.points, [-4, 2, 2]);
});

test('higher-handicap landlord wins a tie only when eligible', () => {
  assert.equal(resolveTieWinner({
    tieOutcome: 'higher-handicap-landlord',
    handicaps: [18, 10, 12],
    landlordIndex: 0
  }), 'landlord');
  assert.equal(resolveTieWinner({
    tieOutcome: 'higher-handicap-landlord',
    handicaps: [10, 10, 12],
    landlordIndex: 0
  }), 'none');
});

test('draw, Pack-win and landlord-win settings resolve directly', () => {
  assert.equal(resolveTieWinner({ tieOutcome: 'draw', handicaps: [0, 0, 0], landlordIndex: 0 }), 'none');
  assert.equal(resolveTieWinner({ tieOutcome: 'peasants', handicaps: [0, 0, 0], landlordIndex: 0 }), 'peasants');
  assert.equal(resolveTieWinner({ tieOutcome: 'landlord', handicaps: [0, 0, 0], landlordIndex: 0 }), 'landlord');
});
