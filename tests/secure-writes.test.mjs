import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [app, setup, migration, edge, config] = await Promise.all([
  readFile(new URL('../app.js', import.meta.url), 'utf8'),
  readFile(new URL('../supabase-setup.sql', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260807180000_secure_scorecard_writes.sql', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/scorecard-write/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../supabase-config.js', import.meta.url), 'utf8')
]);

test('anonymous clients retain read access but lose all direct table writes', () => {
  for (const sql of [setup, migration]) {
    assert.match(sql, /revoke insert, update, delete on public\.vegas_courses from anon, authenticated;/);
    assert.match(sql, /revoke insert, update, delete on public\.vegas_rounds from anon, authenticated;/);
  }
  assert.doesNotMatch(setup, /create policy "vegas_(?:courses|rounds)_(?:insert|update|delete)"/);
});

test('public payloads no longer upload edit codes', () => {
  assert.match(app, /delete publicTotals\.editCode;/);
  assert.doesNotMatch(app.slice(app.indexOf('function courseToCloudRow'), app.indexOf('function golfCourseApiConfig')), /editCode:/);
  assert.match(migration, /set totals = totals - 'editCode'/);
  assert.match(migration, /set pars = pars - 'editCode'/);
});

test('all client writes use the authenticated edge endpoint', () => {
  assert.match(config, /functions\/v1\/scorecard-write/);
  assert.match(app, /secureWriteRequest\('upsert', 'round'/);
  assert.match(app, /secureWriteRequest\('upsert', 'course'/);
  assert.match(app, /secureWriteRequest\('delete', 'round'/);
  assert.match(app, /secureWriteRequest\('delete', 'course'/);
  assert.doesNotMatch(app, /supabaseRequest\('vegas_(?:rounds|courses)'[\s\S]{0,120}method: '(?:POST|PATCH|DELETE)'/);
});

test('server validates codes, strips secrets, and enforces round versions', () => {
  assert.match(edge, /const MASTER_CODE = '59';/);
  assert.match(edge, /credential\.edit_code === code/);
  assert.match(edge, /delete totals\.editCode;/);
  assert.match(edge, /delete .*\.editCode;/);
  assert.match(edge, /version=eq\.\$\{expectedVersion\}/);
  assert.match(edge, /VERSION_CONFLICT/);
  assert.match(edge, /scorecard_check_rate_limit/);
  assert.match(setup, /current_attempts < 8/);
  assert.match(migration, /interval '10 minutes'/);
});

test('a successful takeover remembers its code locally without exposing it to viewers', () => {
  assert.match(app, /const EDIT_CREDENTIALS_KEY = 'jfk\.vegasGolfEditCredentials\.v1'/);
  assert.match(app, /await secureWriteRequest\('verify', 'round'/);
  assert.match(app, /rememberEditCode\('round'/);
  assert.match(app, /editCode: editCodeFor\('round'/);
});

test('finishing a game verifies and remembers the string returned by the code dialog', () => {
  const finishFlow = app.slice(app.indexOf('async function confirmFinishWithCode'), app.indexOf('async function finishCurrentGame'));
  assert.match(finishFlow, /secureWriteRequest\('verify', 'round', round\.id, answer\)/);
  assert.match(finishFlow, /rememberEditCode\('round', round\.id, answer\)/);
  assert.doesNotMatch(finishFlow, /answer\.value/);
});
