import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('landlord explanation consumes the scoring result without recalculating points', () => {
  assert.match(app, /function landlordCalculationExplanation\(result, landlordIndex, config\)/);
  assert.match(app, /result\.selectedPeasantIndexes/);
  assert.match(app, /result\.landlordComparison/);
  assert.match(app, /result\.peasantsAverage/);
  assert.match(app, /result\.manualMultiplier/);
  assert.match(app, /result\.specialMultiplier/);
  assert.match(app, /Pack strokes \(best \{count\} scores\)/);
  assert.match(app, /The average of \(\{scores\}\) is \{average\} strokes/);
  assert.match(app, /This hole is tied/);
  assert.match(app, /function landlordOutcomeExplanation\(result\)/);
  assert.match(app, /if \(result\.multiplier <= 1\) return winner/);
  assert.match(app, /\{winner\} and the points are multiplied by \{total\}x \(manual \{manual\}x × bomb \{special\}x\)/);
  assert.match(app, /function landlordOutcomeRoleIcon\(result\)/);
  assert.match(app, /result\.tied \? '' : roleIconHtml\(result\.landlordWon, 'outcome-role-icon'\)/);
  assert.match(app, /<strong class="landlord-outcome-label">\$\{outcomeIcon\}\$\{escapeHtml\(outcomeLabel\)\}<\/strong>/);
  assert.doesNotMatch(app.slice(app.indexOf('function landlordCalculationExplanation'), app.indexOf('function landlordOutcomeExplanation')), /<p>\$\{escapeHtml\(t\('\(manual/);
  assert.doesNotMatch(app.slice(app.indexOf('function landlordCalculationExplanation'), app.indexOf('function formatLandlordComparisonValue')), /Points balance/);
  assert.match(app, /<details class="calculation-explanation">/);
  assert.match(css, /\.calculation-explanation/);
  assert.match(css, /\.landlord-outcome-label[\s\S]*\.outcome-role-icon/);
});

test('Las Vegas explanation and scorecard sharing consume the same scoreHole result', () => {
  assert.match(app, /function renderVegasCalculationExplanation\(scores, par\)/);
  assert.match(app, /const result = scoreHole\(scores, par, activePlayHoleIndex\)/);
  assert.match(app, /originalValue: low \* 10 \+ high/);
  assert.match(app, /activeValues,/);
  assert.match(app, /function scoreVegasValues\(/);
  assert.match(app, /function scoreHole\(scores, par, holeIndex, scoreMode = state\.scoreMode\)/);
  assert.match(app, /return scoreVegasValues\(\{ gross, net, par, scoreMode, underParFlip: state\.underParFlip/);
  assert.match(app, /scoreRoundTotalsForMode[\s\S]*scoreVegasValues\(\{ gross, net, par, scoreMode: mode/);
  assert.match(css, /\.vegas-hole-result/);
});
