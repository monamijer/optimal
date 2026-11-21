import { TestBed } from '@angular/core/testing';
import { LEARNING_STORE, LearningStore } from '../storage/learning-store';
import { MemoryLearningStore } from '../storage/memory-learning-store';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let store: LearningStore;

  /** New service instance on the same store, like a page reload. */
  const create = async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: LEARNING_STORE, useValue: store }] });
    const service = TestBed.inject(ProgressService);
    await service.ready;
    return service;
  };

  beforeEach(() => {
    localStorage.clear();
    store = new MemoryLearningStore();
  });

  it('starts empty', async () => {
    const service = await create();
    expect(service.last()).toBeNull();
    expect(service.get('algorithms')).toBeUndefined();
  });

  it('keeps the best percentage reached', async () => {
    const service = await create();
    service.record('algorithms', 60);
    service.record('algorithms', 20);
    expect(service.get('algorithms')?.percent).toBe(60);
  });

  it('clamps out-of-range values', async () => {
    const service = await create();
    service.record('a', 250);
    service.record('b', -5);
    expect(service.get('a')?.percent).toBe(100);
    expect(service.get('b')?.percent).toBe(0);
  });

  it('returns the most recently visited course', async () => {
    const service = await create();
    service.record('a', 10);
    service.record('b', 5);
    expect(service.last()?.courseId).toBe('b');
  });

  it('persists in the store and survives a reload', async () => {
    (await create()).record('reseaux', 42);
    expect((await create()).get('reseaux')?.percent).toBe(42);
  });

  it('migrates progress saved by the first version (localStorage)', async () => {
    localStorage.setItem('optimal.progress', JSON.stringify({ securite: { percent: 30, visitedAt: '2026-01-01T00:00:00.000Z' } }));
    const service = await create();
    expect(service.get('securite')?.percent).toBe(30);
    expect(localStorage.getItem('optimal.progress')).toBeNull();
    expect((await store.get('progress', 'securite'))?.value).toBeTruthy();
  });

  it('ignores corrupted legacy storage', async () => {
    localStorage.setItem('optimal.progress', '{not json');
    expect((await create()).last()).toBeNull();
  });
});
