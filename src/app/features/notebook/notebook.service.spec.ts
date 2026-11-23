import { TestBed } from '@angular/core/testing';
import { LEARNING_STORE, LearningStore } from '../../core/storage/learning-store';
import { MemoryLearningStore } from '../../core/storage/memory-learning-store';
import { NotebookService } from './notebook.service';

describe('NotebookService', () => {
  let store: LearningStore;
  const create = async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: LEARNING_STORE, useValue: store }] });
    const service = TestBed.inject(NotebookService);
    await service.ready;
    return service;
  };
  const input = { courseId: 'a', chapterId: 'intro', headingId: 'intro', quote: 'un tableau', note: '' };

  beforeEach(() => (store = new MemoryLearningStore()));

  it('adds, lists per course and survives a reload', async () => {
    const service = await create();
    service.add(input);
    service.add({ ...input, courseId: 'b' });
    expect(service.forCourse('a').length).toBe(1);
    expect(service.count()).toBe(2);
    await new Promise(r => setTimeout(r));
    expect((await create()).count()).toBe(2);
  });

  it('does not duplicate the same passage, and keeps the note', async () => {
    const service = await create();
    service.add({ ...input, note: 'à revoir' });
    service.add(input);
    expect(service.count()).toBe(1);
    expect(service.items()[0].note).toBe('à revoir');
  });

  it('updates a note and removes a highlight', async () => {
    const service = await create();
    const h = service.add(input);
    service.update(h.id, { note: 'ok' });
    expect(service.items()[0].note).toBe('ok');
    service.remove(h.id);
    expect(service.count()).toBe(0);
    await new Promise(r => setTimeout(r));
    expect((await create()).count()).toBe(0);
  });
});
