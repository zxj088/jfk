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
