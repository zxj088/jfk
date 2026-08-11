import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const catalogPath = join(root, 'assets', 'data', 'garmin-courses-catalog.json');
const outputPath = join(root, 'assets', 'data', 'garmin-course-areas.js');
const invalidRegions = new Set(['9 HOLES', '18 HOLES']);
const regionOverrides = new Map([
  ['云南云岭国际乡村俱乐部 | Yunling Golf Club', 'Yunnan'],
  ['吉泰恒岳高尔夫俱乐部 | Jitaihengyue Golf Club', 'Inner Mongolia Autonomous Region'],
  ['海航东方牧歌高尔夫球会 | HNA Dongfang Muge Golf Club', 'Hainan'],
  ['刘公岛高尔夫 | Liugongdao Golf Since 1902', 'Shandong'],
  ['紫清湖高尔夫俱乐部 | Purple Clear Lake Golf Club', 'Jiangsu']
]);

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const countries = new Map();
catalog.courses.forEach(course => {
  const country = String(course.country || '').trim();
  const rawRegion = String(course.region || '').trim();
  const region = regionOverrides.get(String(course.name || '').trim())
    || (invalidRegions.has(rawRegion) ? '' : rawRegion);
  if (!country) return;
  if (!countries.has(country)) countries.set(country, new Set());
  if (region) countries.get(country).add(region);
});

const areas = Array.from(countries, ([country, regions]) => ({
  country,
  regions: Array.from(regions).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
})).sort((a, b) => a.country.localeCompare(b.country, 'en', { sensitivity: 'base' }));

await writeFile(outputPath, `window.JFK_GARMIN_COURSE_AREAS=${JSON.stringify(areas)};\n`, 'utf8');
console.log(`Wrote ${areas.length} countries to ${outputPath}`);
