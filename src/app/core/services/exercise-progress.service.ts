import { Injectable, inject, signal } from '@angular/core';
import { LEARNING_STORE } from '../storage/learning-store';

export interface ExerciseState {
  courseId: string;
  chapterId: string;
  /** Position of the exercise block in the chapter (the same in every language). */
  index: number;
  solved: boolean;
  attempts: number;
  /** ISO date of the first success. */
  solvedAt?: string;
}

const COLLECTION = 'exercises';
export const exerciseId = (courseId: string, chapterId: string, index: number) => `${courseId}:${chapterId}:${index}`;

/** Which exercises were solved, kept in this browser through the LearningStore. */
@Injectable({ providedIn: 'root' })
export class ExerciseProgressService {
  private store = inject(LEARNING_STORE);
  private state = signal<Record<string, ExerciseState>>({});

  readonly ready: Promise<void> = this.load();
  readonly all = this.state.asReadonly();

  isSolved(courseId: string, chapterId: string, index: number): boolean {
    return !!this.state()[exerciseId(courseId, chapterId, index)]?.solved;
  }

  /** Counts one check; a success is kept forever (a later wrong attempt does not undo it). */
  record(courseId: string, chapterId: string, index: number, correct: boolean): void {
    const id = exerciseId(courseId, chapterId, index);
    const prev = this.state()[id];
    const next: ExerciseState = {
      courseId, chapterId, index,
      solved: prev?.solved || correct,
      attempts: (prev?.attempts ?? 0) + 1,
      solvedAt: prev?.solvedAt ?? (correct ? new Date().toISOString() : undefined),
    };
    this.state.update(map => ({ ...map, [id]: next }));
    void this.ready.then(() => this.store.put(COLLECTION, id, next));
  }

  async reload(): Promise<void> {
    await this.ready;
    await this.load();
  }

  private async load(): Promise<void> {
    const records = await this.store.list<ExerciseState>(COLLECTION);
    this.state.update(current => ({ ...Object.fromEntries(records.map(r => [r.id, r.value])), ...current }));
  }
}
