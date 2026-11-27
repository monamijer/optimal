import { Injectable, signal } from '@angular/core';

export interface OutlineHeading { id: string; text: string; level: number; }
export interface OutlineChapter { id: string; title: string; headings: OutlineHeading[]; }
export interface CourseOutline {
  courseId: string;
  chapters: OutlineChapter[];
  /** Index of the first chapter that is still locked (quiz gate); chapters.length when none. */
  lockedFrom?: number;
}

/** Chapters and sections of the course being read, shared with the sidebar. */
@Injectable({ providedIn: 'root' })
export class CourseOutlineService {
  readonly outline = signal<CourseOutline | null>(null);

  set(outline: CourseOutline): void { this.outline.set(outline); }
  clear(): void { this.outline.set(null); }
}
