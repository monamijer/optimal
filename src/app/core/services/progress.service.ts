import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CourseProgress {
  percent: number;      // 0-100, best reading progress reached
  visitedAt: string;    // ISO date of the last visit
}

type ProgressMap = Record<string, CourseProgress>;

/** Reading progress kept in this browser only (no account data, no server). */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly KEY = 'optimal.progress';
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private state = signal<ProgressMap>(this.load());

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
    this.save();
  }

  private load(): ProgressMap {
    if (!this.isBrowser) return {};
    try {
      const parsed = JSON.parse(localStorage.getItem(this.KEY) ?? '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private save(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.state()));
    } catch {
      /* storage full or blocked: progress simply is not persisted */
    }
  }
}
