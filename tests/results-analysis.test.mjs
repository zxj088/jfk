import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, app, css] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../app.js', import.meta.url), 'utf8'),
  readFile(new URL('../styles.css', import.meta.url), 'utf8')
]);

test('results page offers matching score and analysis tabs without the PNG share entry', () => {
  assert.match(html, /id="resultsPrimaryScoreTab"[\s\S]*id="resultsSecondaryScoreTab"[\s\S]*id="resultsAnalysisTab"/);
  assert.match(html, /id="resultsScorePanel"[\s\S]*id="resultsAnalysisPanel"/);
  assert.doesNotMatch(html, /id="shareCurrentScorecard"/);
  assert.match(css, /\.results-view-tabs button\.active[\s\S]*background: var\(--green\)/);
  assert.match(css, /\.analysis-section-title[\s\S]*background: var\(--green\)/);
});

test('analysis reuses scoring results and finishing opens the locked score page', () => {
  assert.match(app, /function analysisHoleRows[\s\S]*landlordHoleResult\(state, holeIndex\)/);
  assert.match(app, /function analysisHoleRows[\s\S]*scoreHole\(scores, par, holeIndex\)/);
  assert.match(app, /function renderGameAnalysis[\s\S]*Points balance/);
  assert.doesNotMatch(app, /checkboxLabel: t\('Share game scoring card'\)/);
  assert.match(app, /render\(\);\s*resultsScoreMode = state\.scoreMode;\s*setResultsPanel\(state\.scoreMode\);\s*switchView\('leaderboard'\);/);
});

test('gross and net tabs recalculate only their own displayed scores and points', () => {
  assert.match(app, /function configureResultsTabs\(\)[\s\S]*primaryMode = state\.scoreMode === 'net'/);
  assert.match(app, /renderHoles\(resultsScoreMode\)/);
  assert.match(app, /renderLandlordLeaderboard\(resultsScoreMode\)/);
  assert.match(app, /renderScoreStrip\(resultsScoreMode\)/);
  assert.match(app, /function totals\(scoreMode = state\.scoreMode\)/);
  assert.match(app, /function renderHoles\(displayMode = state\.scoreMode\)/);
  assert.match(app, /displayMode === 'net' \? netValue : grossValue/);
});

test('analysis localizes hole labels and explains multipliers or flip extras without point-balance rows', () => {
  assert.match(app, /function localizedHoleLabel/);
  assert.match(app, /Manual x\{manual\} × special x\{special\} = x\{total\}/);
  assert.match(app, /Before flip \{before\}; after flip \{after\}; extra \{extra\}/);
  assert.match(app, /function analysisSpecialPointBadges/);
  assert.match(app, /gameType === 'vegas' && !result\.aNumber\.flipped && !result\.bNumber\.flipped/);
  assert.match(app, /gameType === 'landlord' && result\.specialMultiplier <= 1/);
  assert.match(app, /localizedHoleLabel\(multiplied\.hole\).*x\$\{multiplied\.max\}/);
  assert.match(app, /analysis-badge bomb[\s\S]*flipBombIconHtml/);
  assert.match(app, /analysis-badge flip[\s\S]*Extra \{points\}/);
  assert.match(css, /\.analysis-badge\.good[\s\S]*\.analysis-badge\.bad[\s\S]*\.analysis-badge\.bomb/);
  const analysisRows = app.slice(app.indexOf('function analysisHoleRows'), app.indexOf('function renderGameAnalysis'));
  assert.doesNotMatch(analysisRows, /Points balance: \{points\} = 0/);
});
