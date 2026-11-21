import { Injectable, computed, inject, signal } from '@angular/core';
import { LEARNING_STORE } from '../storage/learning-store';

export interface CourseProgress {
  percent: number;      // 0-100, best reading progress reached
  visitedAt: string;    // ISO date of the last visit
}

type ProgressMap = Record<string, CourseProgress>;

const COLLECTION = 'progress';
const LEGACY_KEY = 'optimal.progress'; // first version kept progress in localStorage

/** Reading progress, kept in this browser through the LearningStore. */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private store = inject(LEARNING_STORE);
  private state = signal<ProgressMap>({});

  /** Resolves when saved progress has been loaded. */
  readonly ready: Promise<void> = this.hydrate();

  all = this.state.asReadonly();

  /** Most recently visited course, if any. */
  last = computed(() => {
    const entries = Object.entries(this.state());
    if (!entries.length) return null;
    // On equal timestamps the entry written last wins
    const [courseId, progress] = entries.reduce((best, cur) => (cur[1].visitedAt >= best[1].visitedAt ? cur : best));
    return { courseId, ...progress };
  });

  get(courseId: string): CourseProgress | undefined {
    return this.state()[courseId];
  }

  /** Records a visit and keeps the best percentage reached. */
  record(courseId: string, percent: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    const previous = this.state()[courseId];
    const next: CourseProgress = {
      percent: Math.max(previous?.percent ?? 0, clamped),
      visitedAt: new Date().toISOString(),
    };
    this.state.update(map => ({ ...map, [courseId]: next }));
    void this.store.put(COLLECTION, courseId, next);
  }

  private async hydrate(): Promise<void> {
    await this.migrateLegacy();
    const records = await this.store.list<CourseProgress>(COLLECTION);
    // Progress recorded while loading wins over what was stored
    this.state.update(current => ({
      ...Object.fromEntries(records.map(r => [r.id, r.value])),
      ...current,
    }));
  }

  private async migrateLegacy(): Promise<void> {
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return;
      const legacy = JSON.parse(raw) as ProgressMap;
      for (const [id, value] of Object.entries(legacy)) await this.store.put(COLLECTION, id, value);
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* no localStorage or corrupted legacy data: nothing to migrate */
    }
  }
}
