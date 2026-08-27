import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('global Garmin catalog provides worldwide 9/18-hole source records', async () => {
  const catalog = JSON.parse(await readFile(new URL('assets/data/garmin-courses-catalog.json', root), 'utf8'));
  assert.ok(Array.isArray(catalog.courses));
  assert.ok(catalog.courses.length > 40_000);

  const countries = new Set(catalog.courses.map(course => course.country).filter(Boolean));
  assert.ok(countries.size > 100);
  assert.ok(countries.has('China'));
  assert.ok(countries.has('Sweden'));

  const swedenRegions = new Set(catalog.courses
    .filter(course => course.country === 'Sweden')
    .map(course => course.region)
    .filter(Boolean));
  assert.ok(swedenRegions.has('Stockholm'));
  assert.ok(catalog.courses.some(course => course.holes === 9));
  assert.ok(catalog.courses.some(course => course.holes === 18));
});

test('course search UI uses local 18-hole Garmin records only', async () => {
  const [app, html] = await Promise.all([
    readFile(new URL('app.js', root), 'utf8'),
    readFile(new URL('index.html', root), 'utf8')
  ]);
  assert.match(app, /GARMIN_COURSE_CATALOG_URL = '\.\/assets\/data\/garmin-courses-catalog\.json'/);
  assert.match(app, /function buildGarminCourseAreas\(courses\)/);
  assert.match(app, /function searchGarminCourses\(\)/);
  assert.match(app, /\.filter\(course => course\.name && course\.country && course\.holes === 18\)/);
  assert.match(app, /GARMIN_INVALID_REGIONS = new Set\(\['9 HOLES', '18 HOLES'\]\)/);
  assert.match(app, /'刘公岛高尔夫 \| Liugongdao Golf Since 1902', 'Shandong'/);
  assert.match(app, /function localizedCountryName\(country\)/);
  assert.match(app, /function localizedRegionName\(country, region\)/);
  assert.match(app, /zh-CN-u-co-pinyin/);
  assert.match(app, /GARMIN_FEATURED_COUNTRIES/);
  assert.match(app, /Popular countries/);
  assert.match(app, /window\.JFK_GARMIN_COURSE_AREAS/);

  const submitHandler = app.slice(
    app.indexOf("els.courseSearchForm.addEventListener('submit'"),
    app.indexOf("els.cancelCourse.addEventListener", app.indexOf("els.courseSearchForm.addEventListener('submit'"))
  );
  assert.match(submitHandler, /searchGarminCourses\(\)/);
  assert.doesNotMatch(submitHandler, /searchOnlineCourses|searchGolfCourses|fetchGolfCourseDetail/);
  assert.doesNotMatch(html, /Search online database|Course in North America/);
  assert.doesNotMatch(html, /id="courseSearchInclude9"|id="courseSearchInclude18"/);
  assert.match(html, /id="addCourse" type="button">Manual Add</);
  assert.match(html, /id="courseSearchPagination"/);
  assert.match(html, /assets\/data\/garmin-course-areas\.js\?v=218/);
});

test('lightweight area index is complete and excludes bogus hole-count regions', async () => {
  const source = await readFile(new URL('assets/data/garmin-course-areas.js', root), 'utf8');
  const areas = JSON.parse(source.replace(/^window\.JFK_GARMIN_COURSE_AREAS=/, '').replace(/;\s*$/, ''));
  assert.equal(areas.length, 138);
  const china = areas.find(area => area.country === 'China');
  assert.ok(china);
  assert.ok(china.regions.includes('Beijing'));
  assert.ok(china.regions.includes('Shanghai'));
  assert.ok(china.regions.includes('Shandong'));
  assert.ok(china.regions.includes('Yunnan'));
  assert.ok(areas.every(area => !area.regions.includes('9 HOLES') && !area.regions.includes('18 HOLES')));
});

test('new-game area filtering treats Stockholm and Stockholm County as the same region', async () => {
  const [app, seed] = await Promise.all([
    readFile(new URL('app.js', root), 'utf8'),
    readFile(new URL('data/shared-courses.seed.json', root), 'utf8').then(JSON.parse)
  ]);
  const stockholmCourses = seed.filter(course => (
    course.country === 'Sweden' && course.region === 'Stockholm County'
  ));

  assert.ok(stockholmCourses.length > 0);
  assert.match(app, /function normalizedCourseAreaValue\(value\)/);
  assert.match(app, /normalizedCourseAreaValue\(courseRegion\(course\)\) === normalizedCourseAreaValue\(region\)/);
});
