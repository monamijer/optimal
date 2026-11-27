/* Runs learners' SQL in an isolated Web Worker: no access to the page, its storage or cookies.
   SQLite (sql.js, WebAssembly) works on a throwaway in-memory database created for each request. */
importScripts('vendor/sqljs/sql-wasm.js');

const LIMIT = 200;
const ready = initSqlJs({ locateFile: file => 'vendor/sqljs/' + file });

/** Runs statements; returns the last result set, or null when no statement returned rows. */
function lastTable(db, sql) {
  const results = db.exec(sql);
  const last = results[results.length - 1];
  if (!last) return null;
  return { columns: last.columns, rows: last.values.slice(0, LIMIT), total: last.values.length };
}

function attempt(SQL, setup, sql, check) {
  const db = new SQL.Database();
  try {
    db.exec(setup);
    try {
      const table = check ? (db.exec(sql), lastTable(db, check)) : lastTable(db, sql);
      return { table };
    } catch (e) {
      return { error: String(e && e.message ? e.message : e) };
    }
  } finally {
    db.close();
  }
}

self.onmessage = async event => {
  const { id, setup, learner, solution, check } = event.data;
  try {
    const SQL = await ready;
    const result = { id, learner: attempt(SQL, setup, learner, check) };
    if (solution !== undefined) result.solution = attempt(SQL, setup, solution, check);
    self.postMessage(result);
  } catch (e) {
    self.postMessage({ id, fatal: String(e && e.message ? e.message : e) });
  }
};
