import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, app, css, i18n] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../app.js', import.meta.url), 'utf8'),
  readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../i18n.js', import.meta.url), 'utf8')
]);

test('results page offers score and analysis tabs with a scoring-basis selector', () => {
  assert.match(html, /id="resultsScoreTab"[\s\S]*id="resultsAnalysisTab"/);
  assert.match(html, /id="resultsScoreModeSelect"/);
  assert.match(html, /id="resultsScorePanel"[\s\S]*id="resultsAnalysisPanel"/);
  assert.doesNotMatch(html, /id="shareCurrentScorecard"/);
  assert.match(css, /\.results-view-tabs button\.active[\s\S]*background: var\(--green\)/);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\) clamp\(132px, 25vw, 176px\)/);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*\.results-controls[^}]*grid-template-columns: minmax\(0, 1fr\) 132px/);
  assert.match(css, /\.analysis-section-title[\s\S]*background: var\(--green\)/);
  assert.match(i18n, /'Net \(game setting\)': '净杆（比赛设定）'/);
  assert.match(i18n, /'Gross \(reference\)': '总杆（仅供参考）'/);
  assert.match(i18n, /'Special scores, flips and bombs are always determined by actual gross strokes\.': '特殊成绩、翻转和炸弹始终按实际总杆判定。'/);
});

test('analysis labels remain fully localized and special scores always use gross strokes', () => {
  assert.match(i18n, /'Under Par Flip On': '低于标准杆翻转开启'/);
  assert.match(i18n, /'Under Par Flip Off': '低于标准杆翻转关闭'/);
  assert.match(i18n, /'Flip': '翻转'/);
  assert.match(i18n, /'Hole in one': '一杆进洞'/);
  assert.match(app, /const aUnderPar = Math\.min\(gross\[0\], gross\[1\]\) < par/);
  assert.match(app, /const specialLevel = score =>[\s\S]*baseResult\.gross/);
  assert.match(app, /function analysisSpecialScores[\s\S]*const score = parseScore\(rawScore\)/);
  assert.match(app, /function analysisSpecialPointBadges[\s\S]*const gross = scores\.slice\(0, playerCount\)\.map\(parseScore\)/);
});

test('analysis reuses scoring results and finishing opens the locked score page', () => {
  assert.match(app, /function analysisHoleRows[\s\S]*landlordHoleResult\(displayState, holeIndex\)/);
  assert.match(app, /function analysisHoleRows[\s\S]*scoreHole\(scores, par, holeIndex, displayMode\)/);
  assert.match(app, /function renderGameAnalysis[\s\S]*Total score/);
  const renderedAnalysis = app.slice(app.indexOf('function renderGameAnalysis'), app.indexOf('function roundFromState'));
  assert.doesNotMatch(renderedAnalysis, /Points balance/);
  assert.doesNotMatch(app, /checkboxLabel: t\('Share game scoring card'\)/);
  assert.match(app, /render\(\);\s*resultsScoreMode = state\.scoreMode;\s*setResultsPanel\('scores'\);\s*switchView\('leaderboard'\);/);
});

test('gross and net selector recalculates scores and analysis without changing the saved game', () => {
  assert.match(app, /function configureResultsControls\(\)[\s\S]*officialMode = state\.scoreMode === 'net'/);
  assert.match(app, /Net · Official[\s\S]*Gross · Reference/);
  assert.match(app, /renderHoles\(resultsScoreMode\)/);
  assert.match(app, /renderLandlordLeaderboard\(resultsScoreMode\)/);
  assert.match(app, /renderScoreStrip\(resultsScoreMode\)/);
  assert.match(app, /renderGameAnalysis\(resultsScoreMode\)/);
  assert.match(app, /function totals\(scoreMode = state\.scoreMode\)/);
  assert.match(app, /function renderHoles\(displayMode = state\.scoreMode\)/);
  assert.match(app, /displayMode === 'net' \? netValue : grossValue/);
  assert.match(app, /const grossTone = grossScoreTone\(grossValue, course\.pars\[index\]\)/);
  assert.doesNotMatch(app, /displayMode === 'net'[^;]+grossScoreTone/);
  const selectorListener = app.slice(app.indexOf("els.resultsScoreModeSelect?.addEventListener('change'"), app.indexOf("els.rulesButton.addEventListener"));
  assert.doesNotMatch(selectorListener, /persistActiveGame|scheduleAutoSync|saveState|upsertCloudRound/);
});

test('analysis localizes hole labels and explains multipliers or flip extras without point-balance rows', () => {
  assert.match(app, /function localizedHoleLabel/);
  assert.match(app, /Manual x\{manual\} × special x\{special\} = x\{total\}/);
  assert.match(app, /Before flip \{before\}; after flip \{after\}; extra \{extra\}/);
  assert.match(app, /wasFlipped \? `<p><strong>[\s\S]*Before flip[\s\S]*: ''/);
  assert.match(app, /function analysisSpecialPointBadges/);
  assert.match(app, /gameType === 'vegas' && !result\.aNumber\.flipped && !result\.bNumber\.flipped/);
  assert.match(app, /gameType === 'landlord' && result\.specialMultiplier <= 1/);
  assert.match(app, /Multiplier holes'\),[\s\S]*value: String\(multiplied\.count\)/);
  assert.match(app, /analysis-badge bomb[\s\S]*flipBombIconHtml/);
  assert.match(app, /analysis-badge flip[\s\S]*Extra \{points\}/);
  assert.match(css, /\.analysis-badge\.good[\s\S]*\.analysis-badge\.bad[\s\S]*\.analysis-badge\.bomb/);
  const analysisRows = app.slice(app.indexOf('function analysisHoleRows'), app.indexOf('function renderGameAnalysis'));
  assert.doesNotMatch(analysisRows, /Points balance: \{points\} = 0/);
});

test('highlight cards open detailed lists whose items jump to matching hole analysis', () => {
  assert.match(html, /id="analysisHighlightModal"[\s\S]*id="analysisHighlightList"/);
  assert.match(app, /function analysisHighlightCard[\s\S]*data-analysis-highlight/);
  assert.match(app, /id="analysis-hole-\$\{holeIndex \+ 1\}"/);
  assert.match(app, /const biggestItems = biggest \? holes\.filter\(item => item\.magnitude === biggest\.magnitude\)/);
  assert.match(app, /const biggestValue = String\(biggestItems\.length\)/);
  assert.match(app, /Multiplier holes'\),[\s\S]*value: String\(multiplied\.count\)/);
  assert.match(app, /Flip holes'\), value: String\(flipped\.count\)/);
  assert.match(i18n, /'Multiple holes': '多个洞'/);
  assert.match(app, /analysisHighlightCard\('rule-impact', ruleImpact\.label, ruleImpact\.value, ruleImpact\.items\)/);
  assert.match(app, /function openAnalysisHighlightModal[\s\S]*data-analysis-hole/);
  assert.match(app, /function openAnalysisHole[\s\S]*details\.open = true[\s\S]*scrollIntoView/);
  assert.match(app, /function openAnalysisHole[\s\S]*analysis-hole-target[\s\S]*setTimeout/);
  assert.match(app, /items\.length \? '' : ' disabled'/);
  assert.match(css, /\.analysis-highlight-link[\s\S]*cursor: pointer/);
  assert.match(css, /\.analysis-highlight-link:disabled[\s\S]*cursor: default/);
  assert.match(css, /\.analysis-hole\.analysis-hole-target[\s\S]*@keyframes analysis-hole-highlight/);
});

test('landlord player totals open role and biggest-swing details', () => {
  assert.match(app, /function landlordPlayerAnalysisDetails/);
  assert.match(app, /landlordCount[\s\S]*peasantCount[\s\S]*landlordPoints[\s\S]*peasantPoints/);
  assert.match(app, /magnitude > resultSummary\.maxMagnitude[\s\S]*magnitude === resultSummary\.maxMagnitude/);
  assert.match(app, /class="analysis-player analysis-player-detail" data-analysis-highlight/);
  assert.match(app, /data\.stats\?\.length[\s\S]*analysis-detail-stats/);
  assert.match(i18n, /'Wolf holes': '当地主次数'/);
  assert.match(i18n, /'Pack holes': '当农民次数'/);
  assert.match(i18n, /'As Wolf': '当地主总输赢'/);
  assert.match(i18n, /'As Pack': '当农民总输赢'/);
  assert.match(css, /\.analysis-player-detail[\s\S]*cursor: pointer/);
  assert.match(app, /function pointToneClass[\s\S]*point-positive[\s\S]*point-negative/);
  assert.match(app, /As Wolf[\s\S]*points: summary\.landlordPoints/);
  assert.match(app, /data\.items\.map[\s\S]*pointToneClass\(item\.points\)/);
  assert.match(css, /analysis-detail-stats strong\.point-positive[\s\S]*analysis-detail-stats strong\.point-negative/);
});
