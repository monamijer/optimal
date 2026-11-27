/** A query result as returned by the SQL worker. */
export interface SqlTable {
  columns: string[];
  rows: unknown[][];
  /** Number of rows before the display limit was applied. */
  total: number;
}

export type Verdict = { ok: true } | { ok: false; reason: 'error' | 'noResult' | 'columns' | 'rowCount' | 'rows' | 'order' };

const cell = (v: unknown): string => (v === null || v === undefined ? '\u0000NULL' : typeof v === 'number' ? String(Number(v.toFixed(9))) : String(v));
const rowKey = (r: unknown[]) => JSON.stringify(r.map(cell));

/** True when the order of rows matters (the reference query sorts its output). */
export const isOrdered = (sql: string) => /\border\s+by\b/i.test(sql);

/**
 * Same values in the same columns, in any row order unless `ordered`. Column names are not compared: an alias is
 * a free choice. Numbers are compared as numbers (1 equals 1.0).
 */
export function compareResults(expected: SqlTable | null, actual: SqlTable | null, ordered: boolean): Verdict {
  if (!actual) return { ok: false, reason: 'noResult' };
  if (!expected) return { ok: false, reason: 'error' };
  if (expected.columns.length !== actual.columns.length) return { ok: false, reason: 'columns' };
  if (expected.total !== actual.total) return { ok: false, reason: 'rowCount' };
  const a = expected.rows.map(rowKey);
  const b = actual.rows.map(rowKey);
  if (ordered) {
    return a.every((k, i) => k === b[i]) ? { ok: true } : { ok: false, reason: 'order' };
  }
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((k, i) => k === sb[i]) ? { ok: true } : { ok: false, reason: 'rows' };
}
