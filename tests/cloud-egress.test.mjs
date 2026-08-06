import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('background polling is paused and the foreground cadence is bounded', () => {
  assert.match(app, /const EDIT_LOCK_TTL_MS = 30000;/);
  assert.match(app, /const REFRESH_TIMER_TICK_MS = 5000;/);
  assert.match(app, /const EDIT_LOCK_REFRESH_MS = 10000;/);
  assert.match(app, /const LIVE_ROUND_POLL_MS = 15000;/);
  assert.match(app, /const ROUND_INDEX_POLL_MS = 300000;/);
  assert.match(app, /if \(!cloudRefreshEnabled \|\| !hasSupabaseConfig\(\) \|\| document\.hidden \|\| syncState\.busy\) return;/);
  assert.doesNotMatch(app, /}, 1500\);/);
});

test('view-specific refreshes respect golf-paced intervals', () => {
  assert.match(app, /Date\.now\(\) - lastEditLockSyncAt >= EDIT_LOCK_REFRESH_MS/);
  assert.match(app, /Date\.now\(\) - lastLiveRoundSyncAt >= LIVE_ROUND_POLL_MS/);
  assert.match(app, /Date\.now\(\) - lastRoundIndexSyncAt >= ROUND_INDEX_POLL_MS/);
  assert.match(app, /}, REFRESH_TIMER_TICK_MS\);/);
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

test('history defaults to the most recent seven days', () => {
  assert.match(index, /<option value="last-7-days" selected>/);
  assert.match(app, /historyTimeFilter\?\.value \|\| 'last-7-days'/);
});

test('the universal edit code 59 remains available', () => {
  assert.match(app, /value === '59'/);
  assert.match(app, /answer === '59'/);
});
