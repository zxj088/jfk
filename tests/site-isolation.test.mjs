import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [app, i18n, config, manifest] = await Promise.all([
  readFile(new URL('../app.js', import.meta.url), 'utf8'),
  readFile(new URL('../i18n.js', import.meta.url), 'utf8'),
  readFile(new URL('../supabase-config.js', import.meta.url), 'utf8'),
  readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8')
]);

test('jfk uses an independent browser storage namespace', () => {
  const requiredKeys = [
    'jfk.vegasGolfState.v1',
    'jfk.vegasGolfHistory.v1',
    'jfk.vegasGolfCourses.v1',
    'jfk.vegasGolfClientId.v1',
    'jfk.vegasGolfScoringPlayer.v1',
    'jfk.vegasGolfDeletedRounds.v1',
    'jfk.vegasGolfDeletedCourses.v1',
    'jfk.vegasGolfPendingRound.v1',
    'jfk.simpleGolfWelcomeSeen.v1',
    'jfk.simpleGolfScoreDetail.v1',
    'jfk.simpleGolfSwReload.v197'
  ];
  requiredKeys.forEach(key => assert.match(app, new RegExp(key.replaceAll('.', '\\.'))));
  assert.match(i18n, /jfk\.vegasGolfLanguage\.v1/);
});

test('jfk shares cloud game data while keeping an independent PWA identity', () => {
  assert.match(config, /syncKey: 'default'/);
  assert.equal(JSON.parse(manifest).id, '/jfk/');
});

test('jfk uses dedicated app icons', () => {
  const parsed = JSON.parse(manifest);
  assert.ok(parsed.icons.every(icon => icon.src.includes('jfk-icon')));
  assert.match(app, /jfk\.simpleGolfSwReload\.v197/);
});
