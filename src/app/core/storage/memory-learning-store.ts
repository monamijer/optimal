import type { LearningRecord, LearningStore } from './learning-store';

/** In-memory store: fallback when IndexedDB is unavailable, and the test double. */
export class MemoryLearningStore implements LearningStore {
  private data = new Map<string, Map<string, LearningRecord>>();

  async get<T>(collection: string, id: string) {
    return this.data.get(collection)?.get(id) as LearningRecord<T> | undefined;
  }

  async list<T>(collection: string) {
    return [...(this.data.get(collection)?.values() ?? [])] as LearningRecord<T>[];
  }

  async put<T>(collection: string, id: string, value: T, updatedAt = Date.now()) {
    const records = this.data.get(collection) ?? new Map<string, LearningRecord>();
    records.set(id, { id, value, updatedAt });
    this.data.set(collection, records);
  }

  async delete(collection: string, id: string) {
    this.data.get(collection)?.delete(id);
  }

  async dump() {
    const out: Record<string, LearningRecord[]> = {};
    for (const [collection, records] of this.data) out[collection] = [...records.values()];
    return out;
  }

  async clear() {
    this.data.clear();
  }
}
