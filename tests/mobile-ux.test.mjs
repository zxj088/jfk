import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, app, css, mobileCss] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../app.js', import.meta.url), 'utf8'),
  readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../mobile-ux.css', import.meta.url), 'utf8')
]);

test('mobile score display defaults to simple and retains a full-detail control', () => {
  assert.match(app, /scoreDetailMode = localStorage\.getItem\(SCORE_DETAIL_KEY\) === 'full' \? 'full' : 'compact'/);
  assert.match(html, /id="scoreDetailToggle"/);
  assert.match(css, /\.scorecard\.compact-score-detail th:nth-child\(6\)/);
  assert.match(mobileCss, /\.scorecard button\.score small,[\s\S]*font-size: 11\.5px/);
  assert.match(html, /mobile-ux\.css\?v=183/);
});

test('new game setup exposes recent courses and protects dirty forms from Escape', () => {
  assert.match(html, /id="recentCourseChoices"/);
  assert.match(app, /\.slice\(0, 3\)/);
  assert.match(app, /activeOverlay === els\.gameModal && els\.gameForm\.dataset\.dirty === 'true'/);
  assert.match(app, /activeOverlay === els\.gameModal \? els\.newGame : overlayReturnFocus/);
});

test('live game colors are stable and history actions are secondary', () => {
  assert.match(app, /live-color-\$\{stableGameColorIndex\(round\.id\)\}/);
  assert.doesNotMatch(css, /#playingList \.game-row:nth-child/);
  assert.match(app, /card-more-menu/);
  assert.doesNotMatch(html + app, /🎉|🌐/);
});
