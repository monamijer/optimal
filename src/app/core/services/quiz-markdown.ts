import { marked } from 'marked';

/**
 * Quiz syntax inside a course (a fenced block with the language "quiz"):
 *
 *   ```quiz
 *   Question text?
 *   - [ ] a wrong answer
 *   - [x] the right answer
 *   > Optional explanation shown after checking.
 *   ```
 *
 * One `[x]` gives radio buttons, several give checkboxes. The result is plain HTML (fieldset, inputs,
 * a button); it goes through DOMPurify like the rest of the chapter, and the behaviour is attached by
 * the chapter component (event delegation), so no script is ever part of the content.
 */
let counter = 0;

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (s: string) => marked.parseInline(s, { async: false }) as string;

export interface ParsedQuiz {
  question: string;
  options: { text: string; correct: boolean }[];
  explanation: string;
}

/** Returns null when the block is not a valid quiz (the author sees the raw block instead of a broken quiz). */
export function parseQuiz(source: string): ParsedQuiz | null {
  const lines = source.split('\n').map(l => l.trim()).filter(Boolean);
  const question: string[] = [];
  const options: ParsedQuiz['options'] = [];
  const explanation: string[] = [];
  for (const line of lines) {
    const option = /^[-*]\s+\[( |x|X)\]\s+(.+)$/.exec(line);
    if (option) options.push({ text: option[2], correct: option[1].toLowerCase() === 'x' });
    else if (line.startsWith('>')) explanation.push(line.replace(/^>\s?/, ''));
    else if (!options.length) question.push(line);
    else return null; // text between or after options: ambiguous
  }
  if (!question.length || options.length < 2 || !options.some(o => o.correct)) return null;
  return { question: question.join(' '), options, explanation: explanation.join(' ') };
}

export function renderQuiz(source: string, t: (key: string) => string = k => k): string | null {
  const quiz = parseQuiz(source);
  if (!quiz) return null;
  const id = `quiz-${++counter}`;
  const multiple = quiz.options.filter(o => o.correct).length > 1;
  const type = multiple ? 'checkbox' : 'radio';
  const options = quiz.options
    .map((o, i) =>
      `<label class="quiz-option"><input type="${type}" name="${id}" value="${i}"${o.correct ? ' data-correct="1"' : ''}> <span>${inline(o.text)}</span></label>`)
    .join('');
  return (
    `<form class="quiz" data-quiz="${id}" aria-label="${escape(quiz.question.slice(0, 80))}"><fieldset>` +
    `<legend>${inline(quiz.question)}</legend>` +
    `<p class="quiz-hint">${t(multiple ? 'quiz.many' : 'quiz.one')}</p>` +
    `${options}</fieldset>` +
    `<button type="button" class="quiz-check">${t('quiz.check')}</button>` +
    `<div class="quiz-feedback" role="status" aria-live="polite"></div>` +
    (quiz.explanation ? `<div class="quiz-explain" hidden>${inline(quiz.explanation)}</div>` : '') +
    `</form>`
  );
}
