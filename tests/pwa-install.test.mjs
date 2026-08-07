import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('Apple devices receive manual Safari installation guidance', () => {
  assert.match(app, /iPad\|iPhone\|iPod/);
  assert.match(app, /navigator\.platform === 'MacIntel' && navigator\.maxTouchPoints > 1/);
  assert.match(app, /Tap the Share button \(a square with an upward arrow\)/);
  assert.match(app, /first open this page in Safari/);
});

test('installed apps are recognized and Apple PWA metadata is present', () => {
  assert.match(app, /display-mode: standalone/);
  assert.match(app, /navigator\.standalone === true/);
  assert.match(html, /name="apple-mobile-web-app-capable" content="yes"/);
  assert.match(html, /rel="apple-touch-icon"[^>]+jfk-icon-192\.png\?v=199/);
});

test('Android keeps the native install prompt path', () => {
  assert.match(app, /if \(installPromptEvent\)/);
  assert.match(app, /installPromptEvent\.prompt\(\)/);
});
