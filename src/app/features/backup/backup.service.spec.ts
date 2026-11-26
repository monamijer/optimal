import { TestBed } from '@angular/core/testing';
import { LEARNING_STORE, LearningStore } from '../../core/storage/learning-store';
import { MemoryLearningStore } from '../../core/storage/memory-learning-store';
import { ProgressService } from '../../core/services/progress.service';
import { NotebookService } from '../notebook/notebook.service';
import { BackupError, BackupService } from './backup.service';

const DAY = 86_400_000;

describe('BackupService', () => {
  let store: LearningStore;
  let service: BackupService;

  const setup = async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: LEARNING_STORE, useValue: store }] });
    service = TestBed.inject(BackupService);
    await Promise.all([TestBed.inject(ProgressService).ready, TestBed.inject(NotebookService).ready]);
  };
  const fileOf = (obj: unknown) => new File([typeof obj === 'string' ? obj : JSON.stringify(obj)], 'b.json');

  beforeEach(async () => {
    localStorage.removeItem('optimal.backup');
    store = new MemoryLearningStore();
    await store.put('progress', 'algorithms', { percent: 40, visitedAt: '2026-01-01T00:00:00.000Z', completed: ['intro'] });
    await store.put('highlights', 'h1', { id: 'h1', courseId: 'algorithms', chapterId: 'intro', headingId: 'intro', quote: 'un tableau', note: 'à revoir', createdAt: '2026-01-02T00:00:00.000Z' });
    await setup();
  });

  it('exports a checksummed file that parses back to the same data', async () => {
    const backup = await service.build();
    expect(backup.format).toBe('optimal-backup');
    const { summary } = await service.parse(fileOf(backup));
    expect(summary.courses).toBe(1);
    expect(summary.highlights).toBe(1);
  });

  it('rejects a modified file (checksum), non-JSON, a foreign file and a newer schema', async () => {
    const backup = await service.build();
    (backup.data['highlights'][0].value as { note: string }).note = 'modifié à la main';
    await expectAsync(service.parse(fileOf(backup))).toBeRejectedWithError(BackupError, /bk\.err\./);
    await expectAsync(service.parse(fileOf('pas du json'))).toBeRejectedWithError(BackupError, /bk\.err\.unreadable/);
    await expectAsync(service.parse(fileOf({ hello: 1 }))).toBeRejectedWithError(BackupError, /bk\.err\.notBackup/);
    const newer = { ...(await service.build()), schemaVersion: 99 };
    await expectAsync(service.parse(fileOf(newer))).toBeRejectedWithError(BackupError, /bk\.err\.newer/);
  });

  it('rejects entries with the wrong shape', async () => {
    const backup = await service.build();
    (backup.data['progress'][0].value as { percent: number }).percent = 500;
    await expectAsync(service.parse(fileOf(backup))).toBeRejectedWithError(BackupError, /bk\.err\.(entry|damaged)/);
  });

  it('restores into an empty browser (replace) and the services show it', async () => {
    const backup = await service.build();
    store = new MemoryLearningStore();
    await setup();
    await service.restore(backup, 'replace');
    expect(TestBed.inject(ProgressService).isCompleted('algorithms', 'intro')).toBeTrue();
    expect(TestBed.inject(NotebookService).items()[0].note).toBe('à revoir');
  });

  it('merge keeps the newer version of each entry and adds the missing ones', async () => {
    const backup = await service.build();
    // Local data changed after the backup, and one local-only highlight exists
    await new Promise(r => setTimeout(r, 5));
    await store.put('progress', 'algorithms', { percent: 90, visitedAt: '2026-02-01T00:00:00.000Z' });
    await store.put('highlights', 'h2', { id: 'h2', courseId: 'a', chapterId: 'c', headingId: 'c', quote: 'local', note: '', createdAt: '2026-02-02T00:00:00.000Z' });
    await service.restore(backup, 'merge');
    expect(TestBed.inject(ProgressService).get('algorithms')?.percent).toBe(90); // newer local wins
    expect(TestBed.inject(NotebookService).count()).toBe(2); // h1 from backup + local h2
  });

  it('replace erases local entries that are not in the backup', async () => {
    const backup = await service.build();
    await store.put('highlights', 'h2', { id: 'h2', courseId: 'a', chapterId: 'c', headingId: 'c', quote: 'local', note: '', createdAt: '2026-02-02T00:00:00.000Z' });
    await service.restore(backup, 'replace');
    expect(TestBed.inject(NotebookService).count()).toBe(1);
  });

  it('reminds only when there are unsaved changes and the last backup is old, and can be snoozed', async () => {
    await service.refreshStatus();
    expect(service.reminder()).toBeFalse(); // data is recent
    localStorage.setItem('optimal.backup', JSON.stringify({ lastExportAt: Date.now() - 20 * DAY }));
    await service.refreshStatus();
    expect(service.reminder()).toBeTrue();
    service.snooze();
    await service.refreshStatus();
    expect(service.reminder()).toBeFalse();
  });

  it('does not remind when everything is already saved', async () => {
    localStorage.setItem('optimal.backup', JSON.stringify({ lastExportAt: Date.now() + 1000 }));
    await service.refreshStatus();
    expect(service.unsaved()).toBeFalse();
    expect(service.reminder()).toBeFalse();
  });
});
