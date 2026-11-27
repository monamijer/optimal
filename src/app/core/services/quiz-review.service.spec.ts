import { TestBed } from '@angular/core/testing';
import { LEARNING_STORE } from '../storage/learning-store';
import { MemoryLearningStore } from '../storage/memory-learning-store';
import { INTERVAL_DAYS, QuizReviewService, nextState } from './quiz-review.service';

const key = { courseId: 'algorithms', chapterId: 'sorting', index: 0 };
const NOW = Date.parse('2026-01-01T00:00:00Z');
const DAY = 86_400_000;

describe('nextState (Leitner)', () => {
  it('moves up one box per right answer and schedules the next review', () => {
    const first = nextState(undefined, key, true, NOW);
    expect(first.box).toBe(1);
    expect(Date.parse(first.due)).toBe(NOW + INTERVAL_DAYS[1] * DAY);
    const second = nextState(first, key, true, NOW);
    expect(second.box).toBe(2);
    expect(second.attempts).toBe(2);
  });

  it('goes back to box 0 and is due immediately after a wrong answer', () => {
    const known = nextState(nextState(undefined, key, true, NOW), key, true, NOW);
    const missed = nextState(known, key, false, NOW);
    expect(missed.box).toBe(0);
    expect(missed.last).toBe('wrong');
    expect(Date.parse(missed.due)).toBe(NOW);
  });

  it('stops at the last box', () => {
    let s = nextState(undefined, key, true, NOW);
    for (let i = 0; i < 10; i++) s = nextState(s, key, true, NOW);
    expect(s.box).toBe(INTERVAL_DAYS.length - 1);
  });
});

describe('QuizReviewService', () => {
  let store: MemoryLearningStore;
  let service: QuizReviewService;

  beforeEach(() => {
    store = new MemoryLearningStore();
    TestBed.configureTestingModule({ providers: [{ provide: LEARNING_STORE, useValue: store }] });
    service = TestBed.inject(QuizReviewService);
  });

  it('puts missed questions in the review list and takes right ones out', async () => {
    await service.ready;
    service.record('algorithms', 'sorting', 0, false);
    service.record('algorithms', 'sorting', 1, true);
    expect(service.due().map(q => q.index)).toEqual([0]);
    service.record('algorithms', 'sorting', 0, true);
    expect(service.due().length).toBe(0); // box 1 comes back tomorrow
  });

  it('persists and reloads', async () => {
    await service.ready;
    service.record('algorithms', 'sorting', 2, false);
    await new Promise(r => setTimeout(r));
    const stored = await store.list('quizzes');
    expect(stored.map(r => r.id)).toEqual(['algorithms:sorting:2']);
  });
});
