import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('homepage keeps its three main actions above every active game', () => {
  const homeView = html.slice(html.indexOf('id="startView"'), html.indexOf('id="playView"'));
  assert.doesNotMatch(homeView, /<h2>Home<\/h2>/);
  assert.ok(html.indexOf('class="home-actions"') < html.indexOf('id="playingSection"'));
  assert.match(html, /id="newGame"[\s\S]*New game/);
  assert.match(html, /id="homePositioning"[\s\S]*Every hole settled automatically/);
  assert.match(app, /homePositioning\.hidden = playing\.length > 0 \|\| history\.length > 0/);
  assert.match(app, /els\.playingSection\.hidden = playing\.length === 0/);
  assert.match(css, /\.home-action-primary \{ grid-column: 1 \/ -1; \}/);
});

test('homepage lists multiple rounds instead of silently opening the first', () => {
  assert.match(app, /if \(liveRounds\.length === 1\)/);
  assert.match(app, /els\.playingSection\?\.scrollIntoView/);
  assert.match(app, /if \(completedRounds\.length === 1\)/);
  assert.match(app, /els\.historySection\?\.scrollIntoView/);
});

test('the latest completed game can prefill a clean rematch through the existing wizard', () => {
  assert.match(html, /id="rematchCard" hidden/);
  assert.match(html, /id="rematchButton"/);
  assert.match(app, /function openRematchModal\(round\)/);
  assert.match(app, /els\.newGameCode\.value = ''/);
  assert.match(app, /showGameWizardStep\(4\)/);
  assert.match(app, /ensureRoundFullyLoaded\(summary\.id\)/);
  assert.match(app, /els\.rematchCard\.hidden = playing\.length > 0 \|\| !latestCompleted/);
});

test('shared games use a read-only deep link without credentials', () => {
  assert.match(html, /id="shareRoundLink"/);
  assert.match(app, /url\.searchParams\.set\('round', roundId\)/);
  assert.doesNotMatch(app, /searchParams\.set\(['"](?:code|editCode|credential)/);
  assert.match(app, /loadGame\(roundId, false, false\)/);
  assert.match(app, /await openSharedRoundFromUrl\(\)/);
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
