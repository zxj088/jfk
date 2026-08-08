import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('web assets, manifest and service worker use one build number', async () => {
  const [html, app, worker, manifestText] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../app.js', import.meta.url), 'utf8'),
    readFile(new URL('../sw.js', import.meta.url), 'utf8'),
    readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8')
  ]);
  const assetVersions = [...html.matchAll(/(?:styles\.css|sync-logic\.js|round-access\.js|landlord-scoring\.js|i18n\.js|app\.js)\?v=(\d+)/g)].map(match => match[1]);
  const workerRegistration = app.match(/sw\.js\?v=(\d+)/)?.[1];
  const reloadVersion = app.match(/simpleGolfSwReload\.v(\d+)/)?.[1];
  const workerVersion = worker.match(/BUILD__ = 'v(\d+)'/)?.[1];
  const manifestVersion = JSON.parse(manifestText).start_url.match(/[?&]v=(\d+)/)?.[1];
  const versions = [...assetVersions, workerRegistration, reloadVersion, workerVersion, manifestVersion];
  assert.equal(assetVersions.length, 6);
  assert.ok(versions.every(Boolean));
  assert.equal(new Set(versions).size, 1, `Build versions differ: ${versions.join(', ')}`);
});

test('production build copies every local asset referenced by the page', async () => {
  const [html, buildScript] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../scripts/build-web.mjs', import.meta.url), 'utf8')
  ]);
  const referencedAssets = [...html.matchAll(/(?:href|src)="\.\/([^"?]+)(?:\?[^"#]*)?"/g)]
    .map(match => match[1])
    .filter(asset => !asset.startsWith('assets/'));
  for (const asset of referencedAssets) {
    assert.match(buildScript, new RegExp(`['"]${asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`), `${asset} is missing from the production build`);
  }
});
