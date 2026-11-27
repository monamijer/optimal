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
          // Every chapter ends with a quiz: it is what lets the learner move on to the next chapter.
          if (!/```quiz\n/.test(source)) errors.push(`${id}/${file}: chapter has no quiz block (each chapter needs at least one)`);
          // Code exercises: well-formed, and their `@include` files exist
          for (const block of source.matchAll(/```exercise\n([\s\S]*?)```/g)) {
            const sections = [...block[1].matchAll(/^---\s*(setup|starter|solution|check|hint)\s*$/gm)].map(m => m[1]);
            for (const needed of ['setup', 'solution']) if (!sections.includes(needed)) errors.push(`${id}/${file}: an exercise has no "--- ${needed}" section`);
            if (new Set(sections).size !== sections.length) errors.push(`${id}/${file}: an exercise repeats a section`);
            for (const inc of block[1].matchAll(/^@include\s+(\S+)\s*$/gm)) {
              if (!/^[a-z0-9._-]+\.sql$/i.test(inc[1]) || !existsSync(join(coursesDir, id, inc[1]))) errors.push(`${id}/${file}: @include "${inc[1]}" is not a .sql file of this course`);
            }
          }
          const words = source.match(/\S+/g)?.length ?? 0;
          if (words < MIN_WORDS) warnings.push(`${id}/${file}: seulement ${words} mot(s), chapitre à compléter`);
        }
      }
    }
    if (meta.tags !== undefined && !Array.isArray(meta.tags)) errors.push(`${id}: "tags" must be an array`);

    // Translations: optional "i18n" { <lang>: { title, description } } and chapter files "<chapter>.<lang>.md"
    if (meta.i18n !== undefined) {
      if (!meta.i18n || typeof meta.i18n !== 'object' || Array.isArray(meta.i18n)) errors.push(`${id}: "i18n" must be an object`);
      else for (const [lang, texts] of Object.entries(meta.i18n)) {
        if (!/^[a-z]{2}$/.test(lang)) errors.push(`${id}: i18n language "${lang}" must be a two-letter code`);
        for (const field of Object.keys(texts ?? {})) {
          if (!['title', 'description'].includes(field) || typeof texts[field] !== 'string' || !texts[field].trim()) errors.push(`${id}: i18n.${lang}.${field} must be a non-empty string (title or description)`);
        }
      }
    }
    const langs = {};
    if (Array.isArray(meta.chapters)) {
      const chapterSet = new Set(meta.chapters);
      const headingsOf = text => { let code = false; return text.split('\n').filter(l => { if (l.startsWith('```')) code = !code; return !code && /^#{1,6}\s+\S/.test(l); }).map(l => l.match(/^#+/)[0].length); };
      for (const file of readdirSync(join(coursesDir, id)).sort()) {
        const m = /^(.+)\.([a-z]{2})\.md$/.exec(file);
        if (!m) continue;
        const [, base, lang] = m;
        if (!chapterSet.has(`${base}.md`)) { errors.push(`${id}: translation "${file}" has no chapter "${base}.md" in course.json`); continue; }
        const source = readFileSync(join(coursesDir, id, file), 'utf8');
        const original = readFileSync(join(coursesDir, id, `${base}.md`), 'utf8');
        const a = headingsOf(original).join(''), b = headingsOf(source).join('');
        if (a !== b) warnings.push(`${id}/${file}: heading structure differs from ${base}.md (sections should match one to one)`);
        // Quiz answers are stored by position, so a translation must have exactly as many quizzes as the original.
        const quizzes = t => (t.match(/```quiz\n/g) ?? []).length;
        if (quizzes(original) !== quizzes(source)) errors.push(`${id}/${file}: ${quizzes(source)} quiz block(s) but ${base}.md has ${quizzes(original)}`);
        const count = t => (t.match(/```exercise\n/g) ?? []).length;
        if (count(original) !== count(source)) warnings.push(`${id}/${file}: ${count(source)} exercise(s) but ${base}.md has ${count(original)}`);
        const words = source.match(/\S+/g)?.length ?? 0;
        if (words < MIN_WORDS) warnings.push(`${id}/${file}: only ${words} word(s), translation to complete`);
        // Heading ids must also be unique across the translated course
        const seenT = (langs[`${lang}:seen`] ??= new Map());
        let inCode = false;
        for (const line of source.split('\n')) {
          if (line.startsWith('```')) inCode = !inCode;
          const heading = !inCode && /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
          if (!heading) continue;
          const key = slug(heading[1]);
          if (seenT.has(key)) warnings.push(`${id}/${file}: heading "${heading[1]}" already exists in ${seenT.get(key)} (ambiguous links)`); else seenT.set(key, file);
        }
        (langs[lang] ??= []).push(`${base}.md`);
      }
      for (const key of Object.keys(langs)) if (key.includes(':')) delete langs[key];
    }

    courses.push({
      id,
      title: meta.title,
      description: meta.description,
      icon: meta.icon,
      accessLevel: meta.accessLevel,
      category: meta.category,
      tags: meta.tags ?? [],
      chapters: meta.chapters,
      ...(meta.i18n ? { i18n: meta.i18n } : {}),
      ...(Object.keys(langs).length ? { langs } : {}),
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
