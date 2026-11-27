import { Injectable, computed, inject, signal } from '@angular/core';
import { LEARNING_STORE } from '../storage/learning-store';

/** What is remembered about one quiz question (the n-th quiz block of a chapter). */
export interface QuizState {
  courseId: string;
  chapterId: string;
  /** Position of the quiz block in the chapter, so the same state serves every language. */
  index: number;
  /** Leitner box, 0 (just missed) to 5 (known well). */
  box: number;
  /** ISO date from which the question should come back. */
  due: string;
  last: 'right' | 'wrong';
  attempts: number;
}

/** Days before a question comes back, by box. A missed question is due again right away. */
export const INTERVAL_DAYS = [0, 1, 3, 7, 16, 35];
const DAY = 86_400_000;
const COLLECTION = 'quizzes';

export const quizId = (courseId: string, chapterId: string, index: number) => `${courseId}:${chapterId}:${index}`;

/** Leitner step: right answers move up one box, a wrong one goes back to box 0. Pure, so it is easy to test. */
export function nextState(prev: QuizState | undefined, key: { courseId: string; chapterId: string; index: number }, correct: boolean, now: number): QuizState {
  const box = correct ? Math.min(INTERVAL_DAYS.length - 1, (prev?.box ?? 0) + 1) : 0;
  return {
    ...key,
    box,
    due: new Date(now + INTERVAL_DAYS[box] * DAY).toISOString(),
    last: correct ? 'right' : 'wrong',
    attempts: (prev?.attempts ?? 0) + 1,
  };
}

/** Quiz results and the review schedule, kept in this browser through the LearningStore. */
@Injectable({ providedIn: 'root' })
export class QuizReviewService {
  private store = inject(LEARNING_STORE);
  private state = signal<Record<string, QuizState>>({});
  private clock = signal(Date.now());

  readonly ready: Promise<void> = this.hydrate();
  readonly all = this.state.asReadonly();

  /** Questions to review now, the ones missed first, then the longest overdue. */
  readonly due = computed(() => {
    const now = this.clock();
    return Object.values(this.state())
      .filter(q => Date.parse(q.due) <= now)
      .sort((a, b) => (a.box - b.box) || a.due.localeCompare(b.due));
  });

  /** Records the result of one question. Answering the same question again moves it along the schedule. */
  record(courseId: string, chapterId: string, index: number, correct: boolean): void {
    const id = quizId(courseId, chapterId, index);
    const now = Date.now();
    const next = nextState(this.state()[id], { courseId, chapterId, index }, correct, now);
    this.clock.set(now);
    this.state.update(map => ({ ...map, [id]: next }));
    void this.ready.then(() => this.store.put(COLLECTION, id, next));
  }

  /** Re-reads the store (after a backup was restored). */
  async reload(): Promise<void> {
    await this.ready;
    await this.load();
  }

  private async hydrate(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const records = await this.store.list<QuizState>(COLLECTION);
    this.state.update(current => {
      const merged = Object.fromEntries(records.map(r => [r.id, r.value])) as Record<string, QuizState>;
      return { ...merged, ...current }; // answers recorded while loading win
    });
    this.clock.set(Date.now());
  }
}
