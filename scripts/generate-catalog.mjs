#!/usr/bin/env node
/**
 * Builds public/courses/catalog.json from public/courses/<id>/course.json.
 * Fails (exit 1) on invalid metadata or missing chapter files.
 *   node scripts/generate-catalog.mjs          write the catalogue
 *   node scripts/generate-catalog.mjs --check  fail if the committed file is out of date
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ACCESS_LEVELS = ['free', 'premium'];
const MIN_WORDS = 50;

/** Same slug rule as MarkdownService.toSlug: heading ids are used for links, search and the table of contents. */
export const slug = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

/** `warnings` (optional array) receives non-blocking remarks, e.g. chapters that are still empty. */
export function buildCatalog(coursesDir, warnings = []) {
  const errors = [];
  const courses = [];

  const folders = readdirSync(coursesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();

  for (const id of folders) {
    const metaPath = join(coursesDir, id, 'course.json');
    if (!existsSync(metaPath)) {
      errors.push(`${id}: course.json is missing`);
      continue;
    }
    let meta;
    try {
      meta = JSON.parse(readFileSync(metaPath, 'utf8'));
    } catch (error) {
      errors.push(`${id}: course.json is not valid JSON (${error.message})`);
      continue;
    }

    const seen = new Map();
    for (const field of ['title', 'description', 'icon']) {
      if (typeof meta[field] !== 'string' || !meta[field].trim()) errors.push(`${id}: "${field}" must be a non-empty string`);
    }
    if (!ACCESS_LEVELS.includes(meta.accessLevel)) errors.push(`${id}: "accessLevel" must be one of ${ACCESS_LEVELS.join(', ')}`);
    if (!Array.isArray(meta.chapters) || meta.chapters.length === 0) {
      errors.push(`${id}: "chapters" must be a non-empty array`);
    } else {
      for (const file of meta.chapters) {
        if (typeof file !== 'string' || !file.endsWith('.md')) errors.push(`${id}: chapter "${file}" must be a .md file name`);
        else if (!existsSync(join(coursesDir, id, file))) errors.push(`${id}: chapter file "${file}" does not exist`);
        else {
          const source = readFileSync(join(coursesDir, id, file), 'utf8');
          // All chapters of a course are shown on one page: heading ids must be unique across them
          let inCode = false;
          for (const line of source.split('\n')) {
            if (line.startsWith('```')) inCode = !inCode;
            const heading = !inCode && /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
            if (!heading) continue;
            const key = slug(heading[1]);
            if (meta.chapters.some(c => c.replace(/\.md$/, '') === key)) warnings.push(`${id}/${file}: le titre « ${heading[1]} » a le même identifiant que le chapitre « ${key} » (utilisez un titre différent du nom de fichier)`);
            if (seen.has(key)) warnings.push(`${id}/${file}: le titre « ${heading[1]} » existe déjà dans ${seen.get(key)} (liens et recherche ambigus)`);
            else seen.set(key, file);
          }
          const words = source.match(/\S+/g)?.length ?? 0;
          if (words < MIN_WORDS) warnings.push(`${id}/${file}: seulement ${words} mot(s), chapitre à compléter`);
        }
      }
    }
    if (meta.tags !== undefined && !Array.isArray(meta.tags)) errors.push(`${id}: "tags" must be an array`);

    courses.push({
      id,
      title: meta.title,
      description: meta.description,
      icon: meta.icon,
      accessLevel: meta.accessLevel,
      category: meta.category,
      tags: meta.tags ?? [],
      chapters: meta.chapters,
    });
  }

  if (errors.length) throw new Error(errors.join('\n'));
  return { courses };
}

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const coursesDir = join(root, 'public', 'courses');
  const target = join(coursesDir, 'catalog.json');
  let output;
  const warnings = [];
  try {
    output = JSON.stringify(buildCatalog(coursesDir, warnings), null, 2) + '\n';
  } catch (error) {
    console.error(`Catalogue invalide :\n${error.message}`);
    process.exit(1);
  }
  for (const warning of warnings) console.warn(`Attention : ${warning}`);
  if (process.argv.includes('--check')) {
    const current = existsSync(target) ? readFileSync(target, 'utf8') : '';
    if (current !== output) {
      console.error('public/courses/catalog.json is out of date. Run: npm run catalog');
      process.exit(1);
    }
    console.log('catalog.json is up to date.');
    return;
  }
  writeFileSync(target, output);
  console.log(`catalog.json written (${JSON.parse(output).courses.length} courses).`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
