import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCourse, addChapter } from './course-tools.mjs';
import { buildCatalog } from './generate-catalog.mjs';

const tmp = () => mkdtempSync(join(tmpdir(), 'optimal-courses-'));

test('createCourse scaffolds a course the catalogue accepts', () => {
  const dir = tmp();
  createCourse(dir, 'mon_cours', 'Mon cours', { category: 'Test' });
  assert.ok(existsSync(join(dir, 'mon_cours', 'introduction.md')));
  const warnings = [];
  const { courses } = buildCatalog(dir, warnings);
  assert.equal(courses[0].id, 'mon_cours');
  assert.equal(courses[0].accessLevel, 'free');
  assert.deepEqual(courses[0].chapters, ['introduction.md']);
  assert.equal(warnings.length, 0); // the template is long enough
});

test('createCourse refuses bad ids and duplicates', () => {
  const dir = tmp();
  assert.throws(() => createCourse(dir, 'Mon Cours', 'x'), /Identifiant invalide/);
  createCourse(dir, 'ok', 'Ok');
  assert.throws(() => createCourse(dir, 'ok', 'Ok'), /existe déjà/);
});

test('addChapter creates the file and registers it once', () => {
  const dir = tmp();
  createCourse(dir, 'c', 'C');
  addChapter(dir, 'c', 'tris.md', 'Les tris');
  assert.deepEqual(JSON.parse(readFileSync(join(dir, 'c', 'course.json'), 'utf8')).chapters, ['introduction.md', 'tris.md']);
  assert.match(readFileSync(join(dir, 'c', 'tris.md'), 'utf8'), /^# Les tris/);
  assert.throws(() => addChapter(dir, 'c', 'tris.md', 'Les tris'), /existe déjà/);
  assert.throws(() => addChapter(dir, 'c', '../evil.md', 'x'), /invalide/);
  assert.throws(() => addChapter(dir, 'nope', 'a.md', 'x'), /n'existe pas/);
});

test('catalogue warns about empty chapters without failing', () => {
  const dir = tmp();
  createCourse(dir, 'c', 'C');
  writeFileSync(join(dir, 'c', 'introduction.md'), '');
  const warnings = [];
  buildCatalog(dir, warnings);
  assert.match(warnings[0], /0 mot/);
});
