import { computed, inject, Injectable, signal } from '@angular/core';
import { LEARNING_STORE } from '../../core/storage/learning-store';

/** A passage the learner highlighted, with an optional personal note. Never part of the course content. */
export interface Highlight {
  id: string;
  courseId: string;
  chapterId: string;
  /** Closest heading before the passage, to link back to it. */
  headingId: string;
  quote: string;
  note: string;
  createdAt: string;
}

const COLLECTION = 'highlights';

@Injectable({ providedIn: 'root' })
export class NotebookService {
  private store = inject(LEARNING_STORE);
  private state = signal<Highlight[]>([]);

  readonly items = this.state.asReadonly();
  readonly count = computed(() => this.state().length);
  readonly ready: Promise<void> = this.hydrate();

  forCourse(courseId: string): Highlight[] {
    return this.state().filter(h => h.courseId === courseId);
  }

  /** Adds a highlight, or updates the note when the same passage is already saved. */
  add(input: Omit<Highlight, 'id' | 'createdAt'>): Highlight {
    const existing = this.state().find(h => h.courseId === input.courseId && h.chapterId === input.chapterId && h.quote === input.quote);
    if (existing) {
      return this.update(existing.id, { note: input.note || existing.note }) ?? existing;
    }
    const item: Highlight = { ...input, id: this.newId(), createdAt: new Date().toISOString() };
    this.state.update(list => [...list, item]);
    void this.ready.then(() => this.store.put(COLLECTION, item.id, item));
    return item;
  }

  update(id: string, changes: Pick<Highlight, 'note'>): Highlight | undefined {
    let updated: Highlight | undefined;
    this.state.update(list => list.map(h => (h.id === id ? (updated = { ...h, ...changes }) : h)));
    if (updated) {
      const item = updated;
      void this.ready.then(() => this.store.put(COLLECTION, item.id, item));
    }
    return updated;
  }

  remove(id: string): void {
    this.state.update(list => list.filter(h => h.id !== id));
    void this.ready.then(() => this.store.delete(COLLECTION, id));
  }

  private async hydrate(): Promise<void> {
    const records = await this.store.list<Highlight>(COLLECTION);
    const stored = records.map(r => r.value);
    // Keep anything added while loading
    this.state.update(current => [...stored.filter(s => !current.some(c => c.id === s.id)), ...current]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
  }

  private newId(): string {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
