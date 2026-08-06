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
  assert.match(html, /mobile-ux\.css\?v=193/);
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
  assert.match(app, /deleteButton\.className = 'danger history-delete-button'/);
  assert.match(mobileCss, /\.playing-game-row \.score-mode-line\s*\{[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(mobileCss, /\.playing-game-row \.history-result > span:not\(\.winner-icon\)[\s\S]*word-break:\s*normal/);
  assert.doesNotMatch(html + app, /🎉|🌐/);
});

test('history teams, direct delete action, and score pad states remain readable', () => {
  assert.match(app, /teamScoreChip\(t\('Team A'\)/);
  assert.match(app, /teamScoreChip\(t\('Team B'\)/);
  assert.match(mobileCss, /\.history-result\s*\{[\s\S]*grid-template-columns:/);
  assert.match(app, /row\.querySelector\('\.small-actions'\)\.append\(deleteButton\)/);
  assert.doesNotMatch(app, /menuTrigger\.setAttribute\('aria-expanded'/);
  assert.match(mobileCss, /\.game-row \.small-actions > button,[\s\S]*width:\s*64px[\s\S]*min-height:\s*44px/);
  assert.match(app, /classList\.toggle\('history-status-icon', status === 'history'\)/);
  assert.match(mobileCss, /\.playing-game-row,[\s\S]*\.history-game-row\s*\{[\s\S]*min-height:\s*119px[\s\S]*padding:\s*8px 12px[\s\S]*border-left-width:\s*5px/);
  assert.match(mobileCss, /\.playing-game-row \.game-main,[\s\S]*\.history-game-row \.game-main\s*\{\s*font-size:\s*13px/);
  assert.match(mobileCss, /\.score-pad-value\.gross-under-par\s*\{[\s\S]*color:\s*#fff[\s\S]*background:\s*#c43b3b/);
  assert.match(mobileCss, /\.score-quick button\[data-score-clear\][\s\S]*color:\s*#a52626/);
});

test('score entry scrolls up exactly one player row when advancing', () => {
  assert.match(app, /function scrollNextScoreTargetUp\(previousScoreIndex, nextScoreIndex\)/);
  assert.match(app, /rowStep = nextRow\.getBoundingClientRect\(\)\.top - previousRow\.getBoundingClientRect\(\)\.top/);
  assert.match(app, /scroller\.scrollTop \+ rowStep/);
  assert.match(app, /updateScorePad\(\);\s*scrollNextScoreTargetUp\(previousScoreIndex, nextScoreIndex\);/);
  assert.match(app, /document\.body\.classList\.add\('score-pad-open'\)/);
  assert.match(mobileCss, /body\.score-pad-open \.app-shell\s*\{[\s\S]*padding-bottom:\s*calc\(430px/);
  assert.match(app, /function positionScorePadBelowFirstPlayer\(\)/);
  assert.match(app, /firstPlayerRow\?\.getBoundingClientRect\(\)\.bottom/);
  assert.match(app, /positionScorePadBelowFirstPlayer\(\);\s*els\.scorePad\.hidden = false/);
  assert.match(mobileCss, /\.score-pad\s*\{[\s\S]*padding-top:\s*min\(var\(--score-pad-top, 360px\), calc\(100dvh - 300px\)\)/);
  assert.match(app, /data-score-index/);
  assert.match(mobileCss, /\.play-score-button\.under-par\s*\{[\s\S]*color:\s*#fff[\s\S]*background:\s*#c43b3b/);
  assert.match(mobileCss, /\.play-score-button small\s*\{[\s\S]*white-space:\s*nowrap/);
});

test('Vegas winners use signed points and flipped pairs use a bomb icon', () => {
  assert.match(app, /aPointCell\.textContent = signedPoints\(result\.delta\)/);
  assert.match(app, /bPointCell\.textContent = signedPoints\(-result\.delta\)/);
  assert.match(app, /result\.aNumber\.flipped \? flipBombIconHtml\(\)/);
  assert.match(app, /function flipBombIconHtml\(\)/);
  assert.match(app, /function drawFlipBombIcon\(ctx, centerX, centerY, size = 18\)/);
  assert.match(app, /if \(isFlippedPair\) drawFlipBombIcon/);
  assert.match(mobileCss, /\.flip-bomb-icon\s*\{/);
});
