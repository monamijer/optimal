#!/usr/bin/env node
/**
 * Course authoring helpers.
 *   npm run course:new -- <id> "Titre" [--category "Catégorie"] [--premium] [--icon bi-xxx]
 *   npm run course:chapter -- <id> <fichier.md> "Titre du chapitre"
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ID_PATTERN = /^[a-z0-9_]+$/;
const FILE_PATTERN = /^[a-z0-9][a-z0-9_-]*\.md$/;

export function chapterTemplate(title) {
  return `# ${title}

> Objectifs : ce que le lecteur saura faire à la fin de ce chapitre.

## Introduction

Expliquez l'idée en quelques phrases, avec un exemple concret.

## Le concept

Développez, une idée par paragraphe.

## À retenir

- Premier point
- Deuxième point

\`\`\`quiz
Une question pour vérifier la compréhension ?
- [ ] Une mauvaise réponse
- [x] La bonne réponse
- [ ] Une autre mauvaise réponse
> Pourquoi c'est la bonne réponse.
\`\`\`
`;
}

export function createCourse(coursesDir, id, title, { category = 'À classer', premium = false, icon = 'bi-journal-text' } = {}) {
  if (!ID_PATTERN.test(id)) throw new Error(`Identifiant invalide "${id}" : utilisez des minuscules, chiffres et _ (ex. structures_de_donnees).`);
  if (!title?.trim()) throw new Error('Le titre est obligatoire.');
  const dir = join(coursesDir, id);
  if (existsSync(dir)) throw new Error(`Le cours "${id}" existe déjà.`);
  mkdirSync(dir, { recursive: true });
  const meta = {
    title: title.trim(),
    category,
    icon,
    accessLevel: premium ? 'premium' : 'free',
    description: 'Une phrase qui dit ce que le lecteur saura faire après ce cours.',
    tags: ['Débutant'],
    chapters: ['introduction.md'],
  };
  writeFileSync(join(dir, 'course.json'), JSON.stringify(meta, null, 2) + '\n');
  writeFileSync(join(dir, 'introduction.md'), chapterTemplate('Introduction'));
  return dir;
}

export function addChapter(coursesDir, id, file, title) {
  if (!FILE_PATTERN.test(file)) throw new Error(`Nom de fichier invalide "${file}" : minuscules, chiffres, - ou _, extension .md (ex. tris.md).`);
  if (!title?.trim()) throw new Error('Le titre du chapitre est obligatoire.');
  const metaPath = join(coursesDir, id, 'course.json');
  if (!existsSync(metaPath)) throw new Error(`Le cours "${id}" n'existe pas. Créez-le d'abord avec course:new.`);
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  if (meta.chapters.includes(file)) throw new Error(`Le chapitre "${file}" existe déjà dans ${id}.`);
  const path = join(coursesDir, id, file);
  if (existsSync(path)) throw new Error(`Le fichier ${file} existe déjà.`);
  writeFileSync(path, chapterTemplate(title.trim()));
  meta.chapters.push(file);
  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
  return path;
}

function option(args, name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const coursesDir = join(root, 'public', 'courses');
  const [command, ...args] = process.argv.slice(2);
  try {
    if (command === 'new') {
      const [id, title] = args;
      const dir = createCourse(coursesDir, id, title, {
        category: option(args, '--category'),
        icon: option(args, '--icon'),
        premium: args.includes('--premium'),
      });
      console.log(`Cours créé : ${dir}\nÉditez course.json (description, tags) et introduction.md, puis : npm run catalog`);
    } else if (command === 'chapter') {
      const [id, file, title] = args;
      console.log(`Chapitre créé : ${addChapter(coursesDir, id, file, title)}\nPensez à lancer : npm run catalog`);
    } else {
      console.error('Usage :\n  npm run course:new -- <id> "Titre" [--category "..."] [--premium] [--icon bi-xxx]\n  npm run course:chapter -- <id> <fichier.md> "Titre"');
      process.exit(1);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
