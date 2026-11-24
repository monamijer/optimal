import { InjectionToken } from '@angular/core';
import { IndexedDbLearningStore } from './indexeddb-learning-store';
import { MemoryLearningStore } from './memory-learning-store';

/** A stored value with its last modification time (used later to merge backups). */
export interface LearningRecord<T = unknown> {
  id: string;
  value: T;
  updatedAt: number;
}

/**
 * Where the learner's own data lives (progress, notes, answers...).
 * Features depend on this interface only, so the storage (IndexedDB today,
 * a file or a server tomorrow) can change without touching them.
 */
export interface LearningStore {
  get<T>(collection: string, id: string): Promise<LearningRecord<T> | undefined>;
  list<T>(collection: string): Promise<LearningRecord<T>[]>;
  /** `updatedAt` is only given when restoring a backup, to keep the original date. */
  put<T>(collection: string, id: string, value: T, updatedAt?: number): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
  /** Everything, grouped by collection (basis of the export/backup feature). */
  dump(): Promise<Record<string, LearningRecord[]>>;
  clear(): Promise<void>;
}

export const LEARNING_STORE = new InjectionToken<LearningStore>('LEARNING_STORE', {
  providedIn: 'root',
  factory: () => (typeof indexedDB !== 'undefined' ? new IndexedDbLearningStore() : new MemoryLearningStore()),
});
