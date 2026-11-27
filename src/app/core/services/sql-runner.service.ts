import { Injectable } from '@angular/core';
import type { SqlTable } from './sql-compare';

export interface SqlRequest {
  setup: string;
  learner: string;
  /** Reference query; run on its own database so the learner cannot change it. */
  solution?: string;
  /** A SELECT run after the statements (for INSERT/UPDATE/DELETE exercises). */
  check?: string;
}

export interface SqlAttempt { table?: SqlTable | null; error?: string }
export interface SqlResponse { learner: SqlAttempt; solution?: SqlAttempt }

const TIMEOUT_MS = 5000;

/**
 * Runs learner SQL in a Web Worker (public/sql-worker.js). The worker only knows SQLite on a throwaway in-memory
 * database; it is killed if a query runs too long (an endless recursive query, for instance).
 */
@Injectable({ providedIn: 'root' })
export class SqlRunnerService {
  private worker: Worker | null = null;
  private seq = 0;

  run(request: SqlRequest): Promise<SqlResponse> {
    return new Promise((resolve, reject) => {
      if (typeof Worker === 'undefined') return reject(new Error('worker'));
      const worker = this.worker ?? this.create();
      const id = ++this.seq;
      const timer = setTimeout(() => {
        this.kill();
        reject(new Error('timeout'));
      }, TIMEOUT_MS);
      const done = () => {
        clearTimeout(timer);
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
      };
      const onMessage = (e: MessageEvent) => {
        if (e.data?.id !== id) return;
        done();
        if (e.data.fatal) reject(new Error(e.data.fatal));
        else resolve(e.data as SqlResponse);
      };
      const onError = () => { done(); this.kill(); reject(new Error('worker')); };
      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);
      worker.postMessage({ id, ...request });
    });
  }

  private create(): Worker {
    this.worker = new Worker(new URL('sql-worker.js', document.baseURI).href);
    return this.worker;
  }

  private kill(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}
