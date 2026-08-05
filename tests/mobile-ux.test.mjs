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
  assert.match(html, /mobile-ux\.css\?v=187/);
});

test('new game setup exposes recent courses and protects dirty forms from Escape', () => {
  assert.match(html, /id="recentCourseChoices"/);
  assert.match(app, /\.slice\(0, 3\)/);
  assert.match(app, /activeOverlay === els\.gameModal && els\.gameForm\.dataset\.dirty === 'true'/);
  assert.match(app, /activeOverlay === els\.gameModal \? els\.newGame : overlayReturnFocus/);
});

test('mobile setup uses a three-course row and compact help popovers', () => {
  assert.match(mobileCss, /\.recent-course-choices\s*\{\s*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(html, /class="hint-popover"[\s\S]*About scoring mode/);
  assert.match(html, /About under par flip/);
  assert.match(html, /About edit code/);
});

test('live game colors are stable and history actions are secondary', () => {
  assert.match(app, /live-color-\$\{stableGameColorIndex\(round\.id\)\}/);
  assert.doesNotMatch(css, /#playingList \.game-row:nth-child/);
  assert.match(app, /card-more-menu/);
  assert.match(mobileCss, /\.playing-game-row \.score-mode-line\s*\{[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(mobileCss, /\.playing-game-row \.history-result > span:not\(\.winner-icon\)[\s\S]*word-break:\s*normal/);
  assert.doesNotMatch(html + app, /🎉|🌐/);
});

test('history teams, floating delete menu, and score pad states remain readable', () => {
  assert.match(app, /teamScoreChip\(t\('Team A'\)/);
  assert.match(app, /teamScoreChip\(t\('Team B'\)/);
  assert.match(mobileCss, /\.history-result\s*\{[\s\S]*grid-template-columns:/);
  assert.match(mobileCss, /\.card-more-menu\[open\] \.history-delete-button\s*\{[\s\S]*right:\s*48px/);
  assert.match(mobileCss, /\.score-pad-value\.gross-under-par\s*\{[\s\S]*color:\s*#fff[\s\S]*background:\s*#c43b3b/);
  assert.match(mobileCss, /\.score-quick button\[data-score-clear\][\s\S]*color:\s*#a52626/);
});

test('score pad advances and scrolls the selected player into view', () => {
  assert.match(app, /function scrollScoreTargetIntoView\(\)/);
  assert.match(app, /scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\)/);
  assert.match(app, /data-score-index/);
});
