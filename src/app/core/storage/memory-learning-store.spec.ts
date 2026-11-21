import { MemoryLearningStore } from './memory-learning-store';

describe('MemoryLearningStore', () => {
  let store: MemoryLearningStore;
  beforeEach(() => (store = new MemoryLearningStore()));

  it('puts, gets and lists by collection', async () => {
    await store.put('notes', 'a', { text: 'x' });
    await store.put('notes', 'b', { text: 'y' });
    await store.put('progress', 'a', 1);
    expect((await store.get<{ text: string }>('notes', 'a'))?.value.text).toBe('x');
    expect((await store.list('notes')).length).toBe(2);
    expect(await store.get('notes', 'zzz')).toBeUndefined();
  });

  it('deletes and clears', async () => {
    await store.put('notes', 'a', 1);
    await store.delete('notes', 'a');
    expect(await store.list('notes')).toEqual([]);
    await store.put('notes', 'b', 2);
    await store.clear();
    expect(await store.dump()).toEqual({});
  });

  it('dumps everything grouped by collection with timestamps', async () => {
    await store.put('notes', 'a', 1);
    const dump = await store.dump();
    expect(Object.keys(dump)).toEqual(['notes']);
    expect(dump['notes'][0].updatedAt).toBeGreaterThan(0);
  });
});
