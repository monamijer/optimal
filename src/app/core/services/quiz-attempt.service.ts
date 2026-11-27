import { Injectable, inject, signal } from '@angular/core';
import { LEARNING_STORE } from '../storage/learning-store';

/** One official answer. Once recorded it is never changed. */
export interface Answer {
  /** Indexes of the options the learner ticked. */
  picked: number[];
  right: boolean;
  at: string;
}

/** One pass through all the quizzes of a chapter. */
export interface Round {
  startedAt: string;
  answers: Record<number, Answer>;
  /** Set when the last quiz of the chapter was answered. */
  completedAt?: string;
  /** Share of right answers, 0 to 1. */
  score?: number;
  passed?: boolean;
}

/** Everything that was answered in one chapter, oldest round first. Wrong answers stay as a record of weak spots. */
export interface ChapterAttempts {
  courseId: string;
  chapterId: string;
  rounds: Round[];
}

/** Share of right answers needed to pass a chapter. */
export const PASS_RATIO = 0.7;
/** Wait before a failed chapter can be retaken. Passing opens the next chapter at once. */
export const GATE_MS = 24 * 3_600_000;
const COLLECTION = 'attempts';

export const attemptsId = (courseId: string, chapterId: string) => `${courseId}:${chapterId}`;

export type ChapterStatus =
  | { kind: 'none' }                                           // no quiz answered yet
  | { kind: 'open'; answered: number }                          // round in progress
  | { kind: 'passed'; score: number }                          // next chapter is open
  | { kind: 'failed'; score: number; retakeAt: number };       // quizzes can be retaken at retakeAt

const last = (a: ChapterAttempts | undefined): Round | undefined => a?.rounds[a.rounds.length - 1];

/** Where a chapter stands. Pure, so the rules are easy to test. */
export function chapterStatus(a: ChapterAttempts | undefined, now: number): ChapterStatus {
  const r = last(a);
  if (!r) return { kind: 'none' };
  if (!r.completedAt) return { kind: 'open', answered: Object.keys(r.answers).length };
  const end = Date.parse(r.completedAt) + GATE_MS;
  if (r.passed) return { kind: 'passed', score: r.score ?? 1 };
  // A failed round can be replaced by a new one once the wait is over.
  return now >= end ? { kind: 'none' } : { kind: 'failed', score: r.score ?? 0, retakeAt: end };
}

/** The recorded answer to a question in the current round, if any. */
export function officialAnswer(a: ChapterAttempts | undefined, index: number, now: number): Answer | undefined {
  const r = last(a);
  if (!r) return undefined;
  if (r.completedAt && !r.passed && now >= Date.parse(r.completedAt) + GATE_MS) return undefined; // retake allowed
  return r.answers[index];
}

/**
 * Records the first answer to a question. A question that already has an official answer in the current round is
 * left untouched, so reloading the page or going back cannot change it.
 */
export function submitAnswer(
  prev: ChapterAttempts | undefined,
  key: { courseId: string; chapterId: string },
  index: number,
  total: number,
  picked: number[],
  right: boolean,
  now: number,
): { next: ChapterAttempts; accepted: boolean } {
  const base: ChapterAttempts = prev ?? { ...key, rounds: [] };
  if (officialAnswer(prev, index, now)) return { next: base, accepted: false };
  let rounds = base.rounds;
  let round = last(base);
  const retake = round?.completedAt && !round.passed && now >= Date.parse(round.completedAt) + GATE_MS;
  if (!round || retake) {
    round = { startedAt: new Date(now).toISOString(), answers: {} };
    rounds = [...rounds, round];
  }
  const answers = { ...round.answers, [index]: { picked: [...picked].sort((x, y) => x - y), right, at: new Date(now).toISOString() } };
  let updated: Round = { ...round, answers };
  if (total > 0 && Object.keys(answers).length >= total) {
    const good = Object.values(answers).filter(x => x.right).length;
    const score = good / Object.keys(answers).length;
    updated = { ...updated, completedAt: new Date(now).toISOString(), score, passed: score >= PASS_RATIO };
  }
  return { next: { ...base, rounds: [...rounds.slice(0, -1), updated] }, accepted: true };
}

/**
 * Index of the first chapter that is still closed, or `chapters.length` when all are open. Passing a chapter's quizzes
 * (70 %) opens the next one at once; unanswered or failed quizzes keep it closed. A chapter without quiz never
 * blocks (the catalog requires every chapter to have one).
 */
export function firstLockedChapter(
  chapters: { id: string; quizzes: number }[],
  attempts: (chapterId: string) => ChapterAttempts | undefined,
  now: number,
): number {
  for (let i = 0; i < chapters.length - 1; i++) {
    if (chapters[i].quizzes === 0) continue;
    const s = chapterStatus(attempts(chapters[i].id), now);
    if (s.kind !== 'passed') return i + 1;
  }
  return chapters.length;
}

/** Official quiz answers, kept in this browser through the LearningStore. */
@Injectable({ providedIn: 'root' })
export class QuizAttemptService {
  private store = inject(LEARNING_STORE);
  private state = signal<Record<string, ChapterAttempts>>({});

  readonly ready: Promise<void> = this.load();
  readonly all = this.state.asReadonly();

  get(courseId: string, chapterId: string): ChapterAttempts | undefined {
    return this.state()[attemptsId(courseId, chapterId)];
  }

  status(courseId: string, chapterId: string, now = Date.now()): ChapterStatus {
    return chapterStatus(this.get(courseId, chapterId), now);
  }

  answer(courseId: string, chapterId: string, index: number, now = Date.now()): Answer | undefined {
    return officialAnswer(this.get(courseId, chapterId), index, now);
  }

  /** Records the answer unless the question already has one. Returns whether it was accepted. */
  submit(courseId: string, chapterId: string, index: number, total: number, picked: number[], right: boolean): boolean {
    const id = attemptsId(courseId, chapterId);
    const { next, accepted } = submitAnswer(this.state()[id], { courseId, chapterId }, index, total, picked, right, Date.now());
    if (accepted) {
      this.state.update(map => ({ ...map, [id]: next }));
      void this.ready.then(() => this.store.put(COLLECTION, id, next));
    }
    return accepted;
  }

  async reload(): Promise<void> {
    await this.ready;
    await this.load();
  }

  private async load(): Promise<void> {
    const records = await this.store.list<ChapterAttempts>(COLLECTION);
    this.state.update(current => ({ ...Object.fromEntries(records.map(r => [r.id, r.value])), ...current }));
  }
}
