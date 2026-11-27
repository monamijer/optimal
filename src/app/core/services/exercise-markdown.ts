import { marked } from 'marked';

/**
 * Code exercise syntax inside a course (a fenced block with the language "exercise", SQL for now):
 *
 *   ```exercise
 *   Prompt text (blank line = new paragraph).
 *   --- setup
 *   CREATE TABLE t (...); INSERT INTO t ...;
 *   --- starter
 *   SELECT ...
 *   --- solution
 *   SELECT ...
 *   --- check        (optional: a SELECT run after the learner's statements, for INSERT/UPDATE/DELETE exercises)
 *   SELECT * FROM t ORDER BY id;
 *   --- hint         (optional)
 *   Think about GROUP BY.
 *   ```
 *
 * The page only shows the prompt and an editor; the setup, solution and check stay in this module's data and are
 * used to run the learner's SQL in an isolated worker and compare the result with the solution's.
 */
export interface ParsedExercise {
  prompt: string;
  setup: string;
  starter: string;
  solution: string;
  check?: string;
  hint?: string;
}

const MARKER = /^---\s*(setup|starter|solution|check|hint)\s*$/;
const SECTIONS = ['setup', 'starter', 'solution', 'check', 'hint'] as const;
type Section = (typeof SECTIONS)[number];

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (s: string) => marked.parseInline(s, { async: false }) as string;

/** Returns null when the block is not a valid exercise (the author then sees the raw block). */
export function parseExercise(source: string): ParsedExercise | null {
  const parts: Record<string, string[]> = { prompt: [] };
  let current = 'prompt';
  for (const line of source.replace(/\r/g, '').split('\n')) {
    const m = MARKER.exec(line.trim());
    if (m) {
      current = m[1];
      if (parts[current]) return null; // a section twice
      parts[current] = [];
    } else {
      parts[current].push(line);
    }
  }
  const text = (k: Section | 'prompt') => (parts[k] ?? []).join('\n').trim();
  const prompt = text('prompt');
  const setup = text('setup');
  const solution = text('solution');
  if (!prompt || !setup || !solution) return null;
  return { prompt, setup, starter: text('starter'), solution, check: text('check') || undefined, hint: text('hint') || undefined };
}

export function renderExercise(source: string, t: (key: string) => string = k => k, index = 0): string | null {
  const ex = parseExercise(source);
  if (!ex) return null;
  const id = `ex-${index}-${Math.random().toString(36).slice(2, 7)}`;
  const paragraphs = ex.prompt.split(/\n\s*\n/).map(p => `<p>${inline(p.replace(/\n/g, ' '))}</p>`).join('');
  const rows = Math.min(10, Math.max(3, ex.starter.split('\n').length + 1));
  return (
    `<form class="exercise" data-ei="${index}" aria-label="${escape(t('ex.label'))}">` +
    `<span class="ex-badge">${escape(t('ex.solved'))}</span>` +
    `<div class="ex-prompt">${paragraphs}</div>` +
    `<label class="visually-hidden" for="${id}">${escape(t('ex.editor'))}</label>` +
    `<textarea id="${id}" class="ex-input" rows="${rows}" spellcheck="false" autocapitalize="off" autocomplete="off">${escape(ex.starter)}</textarea>` +
    `<div class="ex-actions">` +
    `<button type="button" class="ex-check">${escape(t('ex.check'))}</button>` +
    `<button type="button" class="ex-run">${escape(t('ex.run'))}</button>` +
    (ex.hint ? `<button type="button" class="ex-hint-btn">${escape(t('ex.hint'))}</button>` : '') +
    `<button type="button" class="ex-reset">${escape(t('ex.reset'))}</button>` +
    `</div>` +
    `<div class="ex-out" role="status" aria-live="polite"></div>` +
    `</form>`
  );
}
