import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('landlord explanation consumes the scoring result without recalculating points', () => {
  assert.match(app, /function landlordCalculationExplanation\(result, landlordIndex, config\)/);
  assert.match(app, /result\.selectedPeasantIndexes/);
  assert.match(app, /result\.landlordTotal/);
  assert.match(app, /result\.peasantsTotal/);
  assert.match(app, /result\.manualMultiplier/);
  assert.match(app, /result\.specialMultiplier/);
  assert.match(app, /result\.points\.map\(signedPoints\)/);
  assert.match(app, /<details class="calculation-explanation">/);
  assert.match(css, /\.calculation-explanation/);
});

test('Las Vegas explanation and scorecard sharing consume the same scoreHole result', () => {
  assert.match(app, /function renderVegasCalculationExplanation\(scores, par\)/);
  assert.match(app, /const result = scoreHole\(scores, par, activePlayHoleIndex\)/);
  assert.match(app, /originalValue: low \* 10 \+ high/);
  assert.match(app, /activeValues,/);
  assert.match(app, /function scoreVegasValues\(/);
  assert.match(app, /return scoreVegasValues\(\{ gross, net, par, scoreMode: state\.scoreMode/);
  assert.match(app, /scoreRoundTotalsForMode[\s\S]*scoreVegasValues\(\{ gross, net, par, scoreMode: mode/);
  assert.match(css, /\.vegas-hole-result/);
});
