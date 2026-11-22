import { IndexedDbLearningStore } from './indexeddb-learning-store';

describe('IndexedDbLearningStore', () => {
  let store: IndexedDbLearningStore;
  beforeEach(async () => {
    store = new IndexedDbLearningStore();
    await store.clear();
  });
  afterEach(() => store.clear());

  it('round-trips records and isolates collections', async () => {
    await store.put('progress', 'algorithms', { percent: 50 });
    await store.put('notes', 'algorithms', 'n');
    expect((await store.get<{ percent: number }>('progress', 'algorithms'))?.value.percent).toBe(50);
    expect((await store.list('progress')).length).toBe(1);
    expect(Object.keys(await store.dump()).sort()).toEqual(['notes', 'progress']);
  });

  it('overwrites and deletes', async () => {
    await store.put('progress', 'a', 1);
    await store.put('progress', 'a', 2);
    expect((await store.get<number>('progress', 'a'))?.value).toBe(2);
    await store.delete('progress', 'a');
    expect(await store.get('progress', 'a')).toBeUndefined();
  });
});
