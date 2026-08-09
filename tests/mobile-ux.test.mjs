import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, app, css, mobileCss, i18n] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../app.js', import.meta.url), 'utf8'),
  readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../mobile-ux.css', import.meta.url), 'utf8'),
  readFile(new URL('../i18n.js', import.meta.url), 'utf8')
]);

test('mobile score display stays complete without a separate detail toolbar', () => {
  assert.match(html, /data-view="play"[\s\S]*>Score<\/span>[\s\S]*data-view="leaderboard"[\s\S]*>Results<\/span>/);
  assert.match(app, /scoreDetailMode = 'full'/);
  assert.doesNotMatch(html, /id="scoreDetailToggle"/);
  assert.doesNotMatch(html, /class="score-display-toolbar"/);
  assert.match(css, /\.scorecard\.compact-score-detail th:nth-child\(6\)/);
  assert.match(mobileCss, /\.scorecard button\.score small,[\s\S]*font-size: 11\.5px/);
  assert.match(html, /mobile-ux\.css\?v=207/);
});

test('the play-page action uses explicit takeover and finish states', () => {
  assert.doesNotMatch(html, /id="editGame"/);
  assert.match(app, /els\.takeOverScoring\.textContent = isEditing \? t\('Finish game'\) : t\('Take over scoring'\)/);
  assert.match(app, /els\.takeOverScoring\.hidden = finished/);
  assert.match(app, /if \(isEditing\) await finishCurrentGame\(\);\s*else await takeOverScoring\(\);/);
  assert.match(app, /isEditing = true;\s*activePlayHoleIndex = firstIncompleteHole\(\);\s*saveState\(\);/);
});

test('new game setup exposes recent courses and protects dirty forms from Escape', () => {
  assert.match(html, /id="recentCourseChoices"/);
  assert.match(app, /\.slice\(0, 3\)/);
  assert.match(app, /activeOverlay === els\.gameModal && els\.gameForm\.dataset\.dirty === 'true'/);
  assert.match(app, /activeOverlay === els\.gameModal \? els\.newGame : overlayReturnFocus/);
});

test('mobile setup uses a three-course row and compact help popovers', () => {
  assert.match(mobileCss, /\.recent-course-choices\s*\{\s*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(html, /class="hint-popover[^\"]*"[\s\S]*About scoring mode/);
  assert.match(html, /About under par flip/);
  assert.match(html, /About edit code/);
});

test('player history suggestions use a labeled button without dropdown arrows', () => {
  assert.match(html, /id="newPlayerA1"[^>]*list="historyPlayerA1"/);
  assert.match(html, /<datalist id="historyPlayerA1"><\/datalist>/);
  assert.match(html, /class="history-picker-button"[^>]*>Past<\/button>/);
  assert.match(html, /class="history-player-menu" hidden/);
  assert.doesNotMatch(css, /history-picker-button::after/);
  assert.match(css, /\.player-name-picker > input::\-webkit-calendar-picker-indicator\s*\{[\s\S]*?display:\s*none !important/);
});

test('landlord setup selects how many best Pack scores are compared', () => {
  assert.match(html, /id="newLandlordBestPeasantCount"/);
  assert.doesNotMatch(html, /id="newLandlordMaxPoints"/);
  assert.match(app, /bestPeasantCount:\s*els\.newLandlordBestPeasantCount\.value/);
  assert.match(app, /renderBestPeasantCountOptions\(playerCount\)/);
});

test('game-rule setup uses clear segmented choices without changing stored select values', () => {
  assert.match(html, /data-select-target="newGameType"/);
  assert.match(html, /data-select-target="newLandlordPlayerCount"/);
  assert.match(html, /data-select-target="newGameScoreMode"/);
  assert.match(html, /data-select-target="newLandlordMode"/);
  assert.match(html, /id="newGameType"[^>]*aria-hidden="true"/);
  assert.match(app, /function syncSegmentedControls/);
  assert.match(app, /root\.matches\?\.\('\[data-select-target\]'\)/);
  assert.match(app, /select\.dispatchEvent\(new Event\('change', \{ bubbles: true \}\)\)/);
  assert.match(css, /\.choice-segments button\.active/);
  assert.match(css, /\.comparison-explainer\s*\{[\s\S]*font-size:\s*11\.5px/);
});

test('game-rule setup explains Wolf comparison and keeps Las Vegas at four players', () => {
  assert.match(html, /id="landlordComparisonExample"/);
  assert.match(html, /How to score a tie/);
  assert.match(app, /els\.newLandlordPlayerCount\.value = '4'/);
  assert.match(app, /Wolf: 5 strokes × \{count\} players = \{total\}/);
  assert.match(app, /Pack: add the best \{count\} player scores/);
  assert.match(app, /The side with fewer strokes wins/);
  assert.match(app, /\[t\('Course'\), t\('Game rules'\), t\('Players and handicaps'\), t\('Review'\)\]/);
});

test('landlord setup offers all four tied-hole outcomes', () => {
  assert.match(html, /id="newLandlordTieOutcome"/);
  assert.match(html, /value="draw">No win or loss/);
  assert.match(html, /value="higher-handicap-landlord">Higher-handicap landlord wins/);
  assert.match(html, /value="peasants">Peasants win/);
  assert.match(html, /value="landlord">Landlord wins/);
  assert.doesNotMatch(html, /id="newLandlordTieWins"/);
  assert.match(app, /tieOutcome:\s*els\.newLandlordTieOutcome\.value/);
});

test('shared landlord scorecard header includes every game setting', () => {
  assert.match(app, /function landlordSettingsParts\(source = state\)/);
  assert.match(app, /Best \{count\} Pack scores/);
  assert.match(app, /Tie: \{result\}/);
  assert.match(app, /Fixed Wolf: \{player\}/);
  assert.match(app, /settingParts\.slice\(0, 3\)\.join/);
  assert.match(app, /settingParts\.slice\(3\)\.join/);
  assert.match(app, /`HCP \$\{normalized\.handicaps\[index\] \|\| 0\}`/);
});

test('landlord multiplier help stays in the wide control column', () => {
  assert.match(css, /\.landlord-action-group > \.field-help\s*\{[\s\S]*?grid-column:\s*2;[\s\S]*?font-size:\s*11px;/);
  assert.match(html, /The manual multiplier is agreed before teeing off on this hole\./);
  assert.match(i18n, /手动倍数为本洞开球前大家约定，炸弹是自动计算总杆低于标准杆翻倍/);
});

test('landlord player choices stay on one equal-width row', () => {
  assert.match(css, /\.landlord-choice-list\s*\{[\s\S]*?repeat\(var\(--landlord-choice-columns, 3\), minmax\(0, 1fr\)\)/);
  assert.match(app, /--landlord-choice-columns', config\.playerCount/);
});

test('landlord result cards use role icons without repeated visible role text', () => {
  assert.match(app, /aria-label="\$\{escapeHtml\(`\$\{player\} · \$\{role\} \$\{points\}`\)\}"/);
  assert.doesNotMatch(app, /\$\{escapeHtml\(player\)\} · \$\{escapeHtml\(role\)\}/);
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
