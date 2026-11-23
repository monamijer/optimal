import { Injectable, computed, inject, signal } from '@angular/core';
import { LEARNING_STORE } from '../storage/learning-store';

export interface CourseProgress {
  percent: number;      // 0-100, best reading progress reached
  visitedAt: string;    // ISO date of the last visit
  completed?: string[]; // ids of chapters the learner marked as done
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
    this.save(courseId, {
      ...previous,
      percent: Math.max(previous?.percent ?? 0, clamped),
      visitedAt: new Date().toISOString(),
    });
  }

  isCompleted(courseId: string, chapterId: string): boolean {
    return this.state()[courseId]?.completed?.includes(chapterId) ?? false;
  }

  completedCount(courseId: string): number {
    return this.state()[courseId]?.completed?.length ?? 0;
  }

  /** Marks a chapter as done, or undoes it. */
  toggleChapter(courseId: string, chapterId: string): void {
    const previous = this.state()[courseId];
    const done = previous?.completed ?? [];
    const completed = done.includes(chapterId) ? done.filter(id => id !== chapterId) : [...done, chapterId];
    this.save(courseId, {
      percent: previous?.percent ?? 0,
      visitedAt: new Date().toISOString(),
      completed,
    });
  }

  private save(courseId: string, next: CourseProgress): void {
    this.state.update(map => ({ ...map, [courseId]: next }));
    // Write after hydration, so a visit recorded while loading cannot erase what was saved
    void this.ready.then(() => this.store.put(COLLECTION, courseId, this.state()[courseId]));
  }

  /** Re-reads everything from the store (after a backup was restored). */
  async reload(): Promise<void> {
    await this.ready;
    const records = await this.store.list<CourseProgress>(COLLECTION);
    this.state.set(Object.fromEntries(records.map(r => [r.id, r.value])));
  }

  private async hydrate(): Promise<void> {
    await this.migrateLegacy();
    const records = await this.store.list<CourseProgress>(COLLECTION);
    // Merge what was stored with visits recorded while loading
    this.state.update(current => {
      const merged: ProgressMap = Object.fromEntries(records.map(r => [r.id, r.value]));
      for (const [id, now] of Object.entries(current)) {
        const saved = merged[id];
        merged[id] = saved
          ? { percent: Math.max(saved.percent, now.percent), visitedAt: now.visitedAt, completed: now.completed ?? saved.completed }
          : now;
      }
      return merged;
    });
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
