import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));

async function readPngDimensions(relativePath) {
  const png = await readFile(new URL(relativePath, import.meta.url));
  assert.equal(png.toString('ascii', 1, 4), 'PNG');
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20), bytes: png.byteLength };
}

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
  assert.match(html, /rel="apple-touch-icon"[^>]+sizes="180x180"[^>]+apple-touch-icon-v202\.png/);
});

test('install icons use valid device-specific dimensions', async () => {
  const appleIcon = await readPngDimensions('../assets/apple-touch-icon-v202.png');
  const pwaIcon = await readPngDimensions('../assets/jfk-icon-192.png');
  assert.deepEqual({ width: appleIcon.width, height: appleIcon.height }, { width: 180, height: 180 });
  assert.deepEqual({ width: pwaIcon.width, height: pwaIcon.height }, { width: 192, height: 192 });
  assert.ok(appleIcon.bytes > 20_000);
  assert.ok(pwaIcon.bytes > 20_000);
  assert.ok(manifest.icons.some((icon) => icon.src.endsWith('jfk-icon-192.png') && icon.sizes === '192x192'));
  assert.ok(manifest.icons.every((icon) => icon.purpose === 'any'));
});

test('Android keeps the native install prompt path', () => {
  assert.match(app, /if \(installPromptEvent\)/);
  assert.match(app, /installPromptEvent\.prompt\(\)/);
});
