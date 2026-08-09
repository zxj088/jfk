import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, app, css] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../app.js', import.meta.url), 'utf8'),
  readFile(new URL('../styles.css', import.meta.url), 'utf8')
]);

test('results page offers matching score and analysis tabs without the PNG share entry', () => {
  assert.match(html, /id="resultsScoreTab"[\s\S]*id="resultsAnalysisTab"/);
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
  assert.match(app, /render\(\);\s*setResultsPanel\('scores'\);\s*switchView\('leaderboard'\);/);
});
