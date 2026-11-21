import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildCatalog } from './generate-catalog.mjs';

const valid = { title: 'T', description: 'D', icon: 'bi-x', accessLevel: 'free', chapters: ['a.md'] };

function fixture(courses) {
  const dir = mkdtempSync(join(tmpdir(), 'catalog-'));
  for (const [id, { meta, files = [] }] of Object.entries(courses)) {
    mkdirSync(join(dir, id));
    if (meta) writeFileSync(join(dir, id, 'course.json'), typeof meta === 'string' ? meta : JSON.stringify(meta));
    for (const f of files) writeFileSync(join(dir, id, f), '# x');
  }
  return dir;
}

test('builds a sorted catalogue with defaults', () => {
  const dir = fixture({ b: { meta: valid, files: ['a.md'] }, a: { meta: valid, files: ['a.md'] } });
  const { courses } = buildCatalog(dir);
  assert.deepEqual(courses.map(c => c.id), ['a', 'b']);
  assert.deepEqual(courses[0].tags, []);
});

test('rejects a missing chapter file', () => {
  const dir = fixture({ a: { meta: valid, files: [] } });
  assert.throws(() => buildCatalog(dir), /chapter file "a.md" does not exist/);
});

test('rejects an invalid access level and a chapter without extension', () => {
  const dir = fixture({ a: { meta: { ...valid, accessLevel: 'gold', chapters: ['a'] }, files: ['a.md'] } });
  assert.throws(() => buildCatalog(dir), /accessLevel[\s\S]*must be a \.md file name/);
});

test('rejects a course folder without course.json and invalid JSON', () => {
  const dir = fixture({ a: {}, b: { meta: '{oops' } });
  assert.throws(() => buildCatalog(dir), /a: course\.json is missing[\s\S]*b: course\.json is not valid JSON/);
});
