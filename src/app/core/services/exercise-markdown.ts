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
 * Answer exercise (a number, an address, a short word; no code runs): same fence, with an `--- answer` section
 * instead of setup/solution. One accepted answer per line; comparison ignores case, extra spaces and a final dot.
 *
 *   ```exercise
 *   Which address is the network address of 192.168.10.77/26?
 *   --- answer
 *   192.168.10.64
 *   --- explain      (optional, shown after a right answer or when the answer is revealed)
 *   /26 blocks are 64 addresses long: 0, 64, 128, 192.
 *   --- hint         (optional)
 *   ```
 *
 * The page only shows the prompt and an editor; the setup, solution and check stay in this module's data and are
 * used to run the learner's SQL in an isolated worker and compare the result with the solution's.
 */
export interface ParsedExercise {
  /** `sql` runs the learner's code; `answer` compares a short typed answer with the accepted ones. */
  kind: 'sql' | 'answer';
  prompt: string;
  setup: string;
  starter: string;
  solution: string;
  check?: string;
  hint?: string;
  /** Accepted answers (kind `answer`). */
  answers?: string[];
  explain?: string;
}

const MARKER = /^---\s*(setup|starter|solution|check|hint|answer|explain)\s*$/;
const SECTIONS = ['setup', 'starter', 'solution', 'check', 'hint', 'answer', 'explain'] as const;
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
  const answers = text('answer').split('\n').map(a => a.trim()).filter(Boolean);
  if (parts['answer']) {
    // An answer exercise has no code to run: mixing both kinds is a mistake.
    if (!prompt || !answers.length || setup || solution || text('check') || text('starter')) return null;
    return { kind: 'answer', prompt, setup: '', starter: '', solution: answers[0], hint: text('hint') || undefined, answers, explain: text('explain') || undefined };
  }
  if (!prompt || !setup || !solution || parts['explain']) return null;
  return { kind: 'sql', prompt, setup, starter: text('starter'), solution, check: text('check') || undefined, hint: text('hint') || undefined };
}

/** Comparison form of an answer: case, spacing and a final dot do not matter. */
export const normalizeAnswer = (s: string) => s.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ').replace(/\.$/, '');

/** True when `typed` equals one of the accepted answers. */
export const isAcceptedAnswer = (typed: string, answers: string[]) => {
  const t = normalizeAnswer(typed);
  return t !== '' && answers.some(a => normalizeAnswer(a) === t);
};

export function renderExercise(source: string, t: (key: string) => string = k => k, index = 0): string | null {
  const ex = parseExercise(source);
  if (!ex) return null;
  const id = `ex-${index}-${Math.random().toString(36).slice(2, 7)}`;
  const paragraphs = ex.prompt.split(/\n\s*\n/).map(p => `<p>${inline(p.replace(/\n/g, ' '))}</p>`).join('');
  if (ex.kind === 'answer') {
    return (
      `<form class="exercise exercise-answer" data-ei="${index}" aria-label="${escape(t('ex.label'))}">` +
      `<span class="ex-badge">${escape(t('ex.solved'))}</span>` +
      `<div class="ex-prompt">${paragraphs}</div>` +
      `<label class="visually-hidden" for="${id}">${escape(t('ex.answerLabel'))}</label>` +
      `<input id="${id}" class="ex-input ex-answer" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="${escape(t('ex.answerLabel'))}">` +
      `<div class="ex-actions">` +
      `<button type="button" class="ex-check">${escape(t('ex.check'))}</button>` +
      (ex.hint ? `<button type="button" class="ex-hint-btn">${escape(t('ex.hint'))}</button>` : '') +
      `<button type="button" class="ex-reset">${escape(t('ex.reset'))}</button>` +
      `</div>` +
      `<div class="ex-out" role="status" aria-live="polite"></div>` +
      `</form>`
    );
  }
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
