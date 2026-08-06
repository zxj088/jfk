import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');

test('background polling is paused and the foreground cadence is bounded', () => {
  assert.match(app, /const ACTIVE_ROUND_POLL_MS = 5000;/);
  assert.match(app, /const ROUND_INDEX_POLL_MS = 30000;/);
  assert.match(app, /if \(!cloudRefreshEnabled \|\| !hasSupabaseConfig\(\) \|\| document\.hidden \|\| syncState\.busy\) return;/);
  assert.doesNotMatch(app, /}, 1500\);/);
});

test('idle refresh uses a lightweight index and only fetches changed rounds', () => {
  assert.match(app, /select=id,saved_at,totals,version/);
  assert.match(app, /changedIds\.map\(fetchCloudRoundById\)/);
  assert.match(app, /watchingLiveRound[\s\S]*refreshCurrentCloudRound\(\)/);
});

test('full cloud sync remains limited to startup and explicit data operations', () => {
  const periodicBlock = app.slice(app.indexOf('window.setInterval(() => {'));
  assert.doesNotMatch(periodicBlock, /syncFromCloud\(false, true\)/);
  assert.match(periodicBlock, /refreshCloudForCurrentView\(\)/);
});
