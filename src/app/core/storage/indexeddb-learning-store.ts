import type { LearningRecord, LearningStore } from './learning-store';
import { MemoryLearningStore } from './memory-learning-store';

interface StoredRow {
  key: string;
  collection: string;
  id: string;
  value: unknown;
  updatedAt: number;
}

const DB_NAME = 'optimal-learning';
const STORE = 'records';

/** IndexedDB implementation. Falls back to memory (private mode, blocked storage). */
export class IndexedDbLearningStore implements LearningStore {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private fallback = new MemoryLearningStore();
  private useFallback = false;

  async get<T>(collection: string, id: string) {
    return this.run(
      store => this.request<StoredRow | undefined>(store.get(`${collection}/${id}`)).then(row => row && this.toRecord<T>(row)),
      'readonly',
      () => this.fallback.get<T>(collection, id),
    );
  }

  async list<T>(collection: string) {
    return this.run(
      store => this.request<StoredRow[]>(store.index('collection').getAll(IDBKeyRange.only(collection))).then(rows => rows.map(r => this.toRecord<T>(r))),
      'readonly',
      () => this.fallback.list<T>(collection),
    );
  }

  async put<T>(collection: string, id: string, value: T) {
    const row: StoredRow = { key: `${collection}/${id}`, collection, id, value, updatedAt: Date.now() };
    await this.run(store => this.request(store.put(row)).then(() => undefined), 'readwrite', () => this.fallback.put(collection, id, value));
  }

  async delete(collection: string, id: string) {
    await this.run(store => this.request(store.delete(`${collection}/${id}`)).then(() => undefined), 'readwrite', () => this.fallback.delete(collection, id));
  }

  async dump() {
    return this.run(
      store => this.request<StoredRow[]>(store.getAll()).then(rows => {
        const out: Record<string, LearningRecord[]> = {};
        for (const row of rows) (out[row.collection] ??= []).push(this.toRecord(row));
        return out;
      }),
      'readonly',
      () => this.fallback.dump(),
    );
  }

  async clear() {
    await this.run(store => this.request(store.clear()).then(() => undefined), 'readwrite', () => this.fallback.clear());
  }

  private toRecord<T>(row: StoredRow): LearningRecord<T> {
    return { id: row.id, value: row.value as T, updatedAt: row.updatedAt };
  }

  private request<T>(req: IDBRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => reject(req.error);
    });
  }

  private open(): Promise<IDBDatabase> {
    this.dbPromise ??= new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const store = req.result.createObjectStore(STORE, { keyPath: 'key' });
        store.createIndex('collection', 'collection');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('IndexedDB blocked'));
    });
    return this.dbPromise;
  }

  private async run<T>(work: (store: IDBObjectStore) => Promise<T>, mode: IDBTransactionMode, fallback: () => Promise<T>): Promise<T> {
    if (this.useFallback) return fallback();
    try {
      const db = await this.open();
      return await work(db.transaction(STORE, mode).objectStore(STORE));
    } catch {
      this.useFallback = true;
      return fallback();
    }
  }
}
