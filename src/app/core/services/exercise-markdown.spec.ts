import { TestBed } from '@angular/core/testing';
import { MarkdownService } from './markdown.service';
import { parseExercise, renderExercise } from './exercise-markdown';
import { SqlTable, compareResults, isOrdered } from './sql-compare';

const SOURCE = `List the names.

Order does not matter.
--- setup
CREATE TABLE t (id INTEGER, name TEXT);
INSERT INTO t VALUES (1, 'a');
--- starter
SELECT
--- solution
SELECT name FROM t;
--- hint
Use SELECT.`;

const table = (rows: unknown[][], columns = ['x']): SqlTable => ({ columns, rows, total: rows.length });

describe('exercise markdown', () => {
  it('parses prompt, setup, starter, solution and optional sections', () => {
    const ex = parseExercise(SOURCE)!;
    expect(ex.prompt).toContain('Order does not matter.');
    expect(ex.setup).toContain('CREATE TABLE');
    expect(ex.starter).toBe('SELECT');
    expect(ex.solution).toBe('SELECT name FROM t;');
    expect(ex.hint).toBe('Use SELECT.');
    expect(ex.check).toBeUndefined();
  });

  it('rejects an exercise without setup or solution, or with a repeated section', () => {
    expect(parseExercise('Only a prompt')).toBeNull();
    expect(parseExercise('P\n--- setup\nX\n')).toBeNull();
    expect(parseExercise(SOURCE + '\n--- solution\nSELECT 1;')).toBeNull();
  });

  it('renders an editor without leaking the solution or the setup into the page', () => {
    const html = renderExercise(SOURCE, k => k, 3)!;
    expect(html).toContain('data-ei="3"');
    expect(html).toContain('class="ex-input"');
    expect(html).not.toContain('SELECT name FROM t');
    expect(html).not.toContain('CREATE TABLE');
  });

  it('keeps the form, textarea and buttons through the sanitiser and numbers exercises by position', () => {
    const md = TestBed.inject(MarkdownService);
    const out = md.parse('# T\n\n```exercise\n' + SOURCE + '\n```\n\ntext\n\n```exercise\n' + SOURCE + '\n```');
    expect([...out.matchAll(/data-ei="(\d+)"/g)].map(m => m[1])).toEqual(['0', '1']);
    expect(out).toContain('<textarea');
    expect(out).toContain('ex-check');
    expect(md.extractExercises('```exercise\n' + SOURCE + '\n```').length).toBe(1);
  });
});

describe('compareResults', () => {
  it('ignores row order unless the reference sorts', () => {
    expect(compareResults(table([[1], [2]]), table([[2], [1]]), false)).toEqual({ ok: true });
    expect(compareResults(table([[1], [2]]), table([[2], [1]]), true)).toEqual({ ok: false, reason: 'order' });
    expect(isOrdered('SELECT * FROM t ORDER BY id')).toBeTrue();
    expect(isOrdered('SELECT * FROM t')).toBeFalse();
  });

  it('compares values, not column names, and numbers as numbers', () => {
    expect(compareResults(table([[1]], ['a']), table([[1.0]], ['b']), false)).toEqual({ ok: true });
    expect(compareResults(table([[null]]), table([[null]]), false)).toEqual({ ok: true });
    expect(compareResults(table([[null]]), table([['NULL']]), false)).toEqual({ ok: false, reason: 'rows' });
  });

  it('explains the difference', () => {
    expect(compareResults(table([[1]]), null, false)).toEqual({ ok: false, reason: 'noResult' });
    expect(compareResults(table([[1]]), table([[1, 2]], ['a', 'b']), false)).toEqual({ ok: false, reason: 'columns' });
    expect(compareResults(table([[1], [2]]), table([[1]]), false)).toEqual({ ok: false, reason: 'rowCount' });
    expect(compareResults(table([[1]]), table([[2]]), false)).toEqual({ ok: false, reason: 'rows' });
  });
});
