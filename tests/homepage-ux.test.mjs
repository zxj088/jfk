import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('homepage prioritizes active games and keeps the new-game action explicit', () => {
  assert.ok(html.indexOf('id="playingSection"') < html.indexOf('class="home-actions"'));
  assert.match(html, /id="newGame"[\s\S]*Start scoring/);
  assert.match(app, /els\.playingSection\.hidden = playing\.length === 0/);
  assert.match(css, /\.home-action-primary \{ grid-column: 1 \/ -1; \}/);
});

test('homepage lists multiple rounds instead of silently opening the first', () => {
  assert.match(app, /if \(liveRounds\.length === 1\)/);
  assert.match(app, /els\.playingSection\?\.scrollIntoView/);
  assert.match(app, /if \(completedRounds\.length === 1\)/);
  assert.match(app, /els\.historySection\?\.scrollIntoView/);
});

test('history filters are collapsible and long history starts with three cards', () => {
  assert.match(html, /id="historyFilterToggle"[^>]*aria-expanded="false"/);
  assert.match(html, /id="historyFilters" hidden/);
  assert.match(html, /id="historyShowMore"/);
  assert.match(app, /filteredHistory\.slice\(0, 3\)/);
  assert.match(app, /historyExpanded \? 'Show less' : 'Show more'/);
});

test('game cards show a visible destination and empty history can clear filters', () => {
  assert.match(app, /class="game-destination"/);
  assert.match(app, /querySelector\('\.game-destination'\)\.textContent = destinationText/);
  assert.match(app, /status === 'playing' \? 'Start a new game' : 'Clear filters'/);
});
