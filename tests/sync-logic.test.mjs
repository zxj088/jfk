import assert from 'node:assert/strict';
import test from 'node:test';

await import('../sync-logic.js');

const { mergeRoundSnapshots, mergeRoundSummaries, reconcileRoundSummaries } = globalThis.SIMPLE_GOLF_SYNC;

test('remote snapshot replaces the same local round', () => {
  const result = mergeRoundSnapshots(
    [{ id: 'round-1', savedAt: 10, version: 1 }],
    [{ id: 'round-1', savedAt: 10, version: 2 }]
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].version, 2);
});

test('local-only pending rounds remain visible after cloud refresh', () => {
  const result = mergeRoundSnapshots(
    [{ id: 'offline-round', savedAt: 30 }],
    [{ id: 'cloud-round', savedAt: 20 }]
  );
  assert.deepEqual(result.map(round => round.id), ['offline-round', 'cloud-round']);
});

test('deleted rounds are filtered from both sources', () => {
  const result = mergeRoundSnapshots(
    [{ id: 'deleted-local', savedAt: 30 }, { id: 'visible', savedAt: 20 }],
    [{ id: 'deleted-cloud', savedAt: 40 }],
    { isDeleted: round => round.id.startsWith('deleted-') }
  );
  assert.deepEqual(result.map(round => round.id), ['visible']);
});

test('rounds are newest first and respect the configured limit', () => {
  const result = mergeRoundSnapshots(
    [{ id: 'old', savedAt: 1 }, { id: 'new', savedAt: 3 }],
    [{ id: 'middle', savedAt: 2 }],
    { limit: 2 }
  );
  assert.deepEqual(result.map(round => round.id), ['new', 'middle']);
});

test('an unchanged summary keeps the existing full local round', () => {
  const full = { id: 'round-1', savedAt: 10, scores: [[4]], totals: { cloudVersion: 3 } };
  const summary = { id: 'round-1', savedAt: 10, summaryOnly: true, totals: { cloudVersion: 3 } };
  const result = mergeRoundSummaries([full], [summary]);
  assert.equal(result[0], full);
});

test('a newer summary replaces stale full data and requires an on-demand load', () => {
  const full = { id: 'round-1', savedAt: 10, scores: [[4]], totals: { cloudVersion: 3 } };
  const summary = { id: 'round-1', savedAt: 10, summaryOnly: true, totals: { cloudVersion: 4 } };
  const result = mergeRoundSummaries([full], [summary]);
  assert.equal(result[0], summary);
  assert.equal(result[0].summaryOnly, true);
});

test('authoritative reconciliation removes local rounds missing from the queried scope', () => {
  const result = reconcileRoundSummaries(
    [
      { id: 'recent-deleted', savedAt: 30 },
      { id: 'recent-live', savedAt: 20 },
      { id: 'older-cached', savedAt: 5 }
    ],
    [{ id: 'recent-live', savedAt: 20, summaryOnly: true }],
    { inScope: round => round.savedAt >= 10 }
  );
  assert.deepEqual(result.map(round => round.id), ['recent-live', 'older-cached']);
});

test('authoritative reconciliation preserves explicitly pending local rounds', () => {
  const pending = { id: 'pending-offline', savedAt: 30 };
  const result = reconcileRoundSummaries(
    [pending],
    [],
    { inScope: () => true, preserve: round => round.id === pending.id }
  );
  assert.equal(result[0], pending);
});
