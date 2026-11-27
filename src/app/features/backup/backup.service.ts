import { effect, inject, Injectable, signal } from '@angular/core';
import { LEARNING_STORE, LearningRecord } from '../../core/storage/learning-store';
import { ExerciseProgressService } from '../../core/services/exercise-progress.service';
import { QuizReviewService } from '../../core/services/quiz-review.service';
import { ProgressService } from '../../core/services/progress.service';
import { NotebookService } from '../notebook/notebook.service';

export const BACKUP_FORMAT = 'optimal-backup';
export const SCHEMA_VERSION = 1;
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_RECORDS = 5000;
const REMIND_AFTER_DAYS = 14;
const SNOOZE_DAYS = 7;
const META_KEY = 'optimal.backup';
const DAY = 86_400_000;

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  schemaVersion: number;
  exportedAt: string;
  data: Record<string, LearningRecord[]>;
  /** SHA-256 of the canonical `data`, to detect a damaged or edited file. */
  checksum: string;
}

export interface BackupSummary {
  exportedAt: string;
  courses: number;
  highlights: number;
  quizzes: number;
  exercises: number;
}

export type ImportMode = 'merge' | 'replace';

interface Meta { lastExportAt?: number; snoozedUntil?: number }

export class BackupError extends Error {}

/** Collections that are saved in a backup file; anything else in the store is ignored. */
const BACKUP_COLLECTIONS = ['progress', 'highlights', 'quizzes', 'exercises'];

/** Canonical JSON: collections and records in a fixed order, so the checksum is stable. */
function canonical(data: Record<string, LearningRecord[]>): string {
  const sorted = Object.keys(data).sort().map(name => [name, [...data[name]].sort((a, b) => a.id.localeCompare(b.id))]);
  return JSON.stringify(sorted);
}

async function sha256(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, max: number): string | null => (typeof v === 'string' && v.length <= max ? v : null);

/** Keeps only known fields of known collections. Returns null for anything malformed. */
function cleanRecord(collection: string, raw: unknown): LearningRecord | null {
  if (!isObj(raw)) return null;
  const id = str(raw['id'], 120);
  const updatedAt = raw['updatedAt'];
  const value = raw['value'];
  if (!id || typeof updatedAt !== 'number' || !Number.isFinite(updatedAt) || !isObj(value)) return null;

  if (collection === 'progress') {
    const percent = value['percent'];
    const visitedAt = str(value['visitedAt'], 40);
    const completed = value['completed'];
    if (typeof percent !== 'number' || percent < 0 || percent > 100 || !visitedAt) return null;
    if (completed !== undefined && !(Array.isArray(completed) && completed.length <= 500 && completed.every(c => str(c, 120) !== null))) return null;
    return { id, updatedAt, value: { percent, visitedAt, ...(completed ? { completed } : {}) } };
  }
  if (collection === 'highlights') {
    const fields = ['courseId', 'chapterId', 'headingId'].map(k => str(value[k], 120));
    const quote = str(value['quote'], 2000);
    const note = str(value['note'] ?? '', 2000);
    const createdAt = str(value['createdAt'], 40);
    if (fields.some(f => f === null) || !quote || note === null || !createdAt) return null;
    return { id, updatedAt, value: { id, courseId: fields[0], chapterId: fields[1], headingId: fields[2], quote, note, createdAt } };
  }
  if (collection === 'quizzes') {
    const courseId = str(value['courseId'], 120);
    const chapterId = str(value['chapterId'], 120);
    const due = str(value['due'], 40);
    const { index, box, attempts, last } = value as Record<string, unknown>;
    const ints = [index, box, attempts].every(n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < 100000);
    if (!courseId || !chapterId || !due || Number.isNaN(Date.parse(due)) || !ints || (last !== 'right' && last !== 'wrong') || (box as number) > 5) return null;
    return { id, updatedAt, value: { courseId, chapterId, index, box, due, last, attempts } };
  }
  if (collection === 'exercises') {
    const courseId = str(value['courseId'], 120);
    const chapterId = str(value['chapterId'], 120);
    const solvedAt = value['solvedAt'] === undefined ? undefined : str(value['solvedAt'], 40);
    const { index, attempts, solved } = value as Record<string, unknown>;
    const ints = [index, attempts].every(n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < 1_000_000);
    if (!courseId || !chapterId || !ints || typeof solved !== 'boolean' || solvedAt === null) return null;
    return { id, updatedAt, value: { courseId, chapterId, index, solved, attempts, ...(solvedAt ? { solvedAt } : {}) } };
  }
  return null;
}

@Injectable({ providedIn: 'root' })
export class BackupService {
  private store = inject(LEARNING_STORE);
  private progress = inject(ProgressService);
  private quizReview = inject(QuizReviewService);
  private exercises = inject(ExerciseProgressService);
  private notebook = inject(NotebookService);

  /** True when the reminder banner should be shown. */
  readonly reminder = signal(false);
  readonly lastExportAt = signal<number | null>(null);
  readonly unsaved = signal(false);
  readonly persisted = signal<boolean | null>(null);

  constructor() {
    this.lastExportAt.set(this.readMeta().lastExportAt ?? null);
    // Re-evaluate whenever learner data changes
    effect(() => {
      this.progress.all();
      this.notebook.items();
      void this.refreshStatus();
    });
  }

  async build(): Promise<BackupFile> {
    await Promise.all([this.progress.ready, this.notebook.ready, this.quizReview.ready, this.exercises.ready]);
    const data = await this.store.dump();
    for (const name of Object.keys(data)) if (!BACKUP_COLLECTIONS.includes(name)) delete data[name];
    return { format: BACKUP_FORMAT, schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data, checksum: await sha256(canonical(data)) };
  }

  /** Builds the file, downloads it and remembers the date. */
  async exportToFile(): Promise<void> {
    const file = await this.build();
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimal-sauvegarde-${file.exportedAt.slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url));
    this.writeMeta({ ...this.readMeta(), lastExportAt: Date.now(), snoozedUntil: undefined });
    this.lastExportAt.set(Date.now());
    await this.refreshStatus();
    void this.requestPersistence(); // after a user action, so a browser prompt is expected
  }

  /** Reads and checks a file without changing anything. Throws BackupError with a message for the learner. */
  async parse(file: File): Promise<{ backup: BackupFile; summary: BackupSummary }> {
    if (file.size > MAX_BYTES) throw new BackupError('bk.err.tooBig');
    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      throw new BackupError('bk.err.unreadable');
    }
    if (!isObj(raw) || raw['format'] !== BACKUP_FORMAT || !isObj(raw['data'])) throw new BackupError('bk.err.notBackup');
    const version = raw['schemaVersion'];
    if (typeof version !== 'number' || version > SCHEMA_VERSION) {
      throw new BackupError('bk.err.newer');
    }

    const data: Record<string, LearningRecord[]> = {};
    let total = 0;
    for (const [name, records] of Object.entries(raw['data'])) {
      if (!BACKUP_COLLECTIONS.includes(name)) continue; // unknown collections are ignored
      if (!Array.isArray(records)) throw new BackupError('bk.err.damaged');
      data[name] = records.map(r => {
        const clean = cleanRecord(name, r);
        if (!clean) throw new BackupError('bk.err.entry');
        return clean;
      });
      total += data[name].length;
    }
    if (total > MAX_RECORDS) throw new BackupError('bk.err.tooMany');

    // The checksum covers the file as exported: compare against the raw data, before cleaning
    const rawData = raw['data'] as Record<string, LearningRecord[]>;
    if (typeof raw['checksum'] !== 'string' || (await sha256(canonical(rawData))) !== raw['checksum']) {
      throw new BackupError('bk.err.checksum');
    }
    const exportedAt = str(raw['exportedAt'], 40) ?? '';
    const backup: BackupFile = { format: BACKUP_FORMAT, schemaVersion: version, exportedAt, data, checksum: raw['checksum'] };
    return { backup, summary: { exportedAt, courses: data['progress']?.length ?? 0, highlights: data['highlights']?.length ?? 0, quizzes: data['quizzes']?.length ?? 0, exercises: data['exercises']?.length ?? 0 } };
  }

  /** Merge keeps the most recent version of each entry; replace erases the current data first. */
  async restore(backup: BackupFile, mode: ImportMode): Promise<void> {
    await Promise.all([this.progress.ready, this.notebook.ready, this.quizReview.ready, this.exercises.ready]);
    if (mode === 'replace') await this.store.clear();
    for (const [collection, records] of Object.entries(backup.data)) {
      for (const record of records) {
        if (mode === 'merge') {
          const current = await this.store.get(collection, record.id);
          if (current && current.updatedAt >= record.updatedAt) continue;
        }
        await this.store.put(collection, record.id, record.value, record.updatedAt);
      }
    }
    await Promise.all([this.progress.reload(), this.notebook.reload(), this.quizReview.reload(), this.exercises.reload()]);
    // What was just restored is, by definition, saved elsewhere
    this.writeMeta({ ...this.readMeta(), lastExportAt: Date.now() });
    this.lastExportAt.set(Date.now());
    await this.refreshStatus();
  }

  snooze(): void {
    this.writeMeta({ ...this.readMeta(), snoozedUntil: Date.now() + SNOOZE_DAYS * DAY });
    this.reminder.set(false);
  }

  /** Whether the browser already protects this site's data from eviction. */
  async checkPersistence(): Promise<void> {
    try {
      if (navigator.storage?.persisted) this.persisted.set(await navigator.storage.persisted());
    } catch {
      this.persisted.set(null);
    }
  }

  /** Asks the browser not to evict this site's data when storage is low. */
  async requestPersistence(): Promise<void> {
    try {
      if (navigator.storage?.persist) this.persisted.set(await navigator.storage.persist());
    } catch {
      this.persisted.set(null);
    }
  }

  async refreshStatus(): Promise<void> {
    await Promise.all([this.progress.ready, this.notebook.ready, this.quizReview.ready, this.exercises.ready]);
    const data = await this.store.dump();
    const records = Object.values(data).flat();
    const meta = this.readMeta();
    const newest = records.reduce((max, r) => Math.max(max, r.updatedAt), 0);
    const oldest = records.reduce((min, r) => Math.min(min, r.updatedAt), Infinity);
    const unsaved = records.length > 0 && newest > (meta.lastExportAt ?? 0);
    this.unsaved.set(unsaved);
    const since = meta.lastExportAt ?? oldest;
    const due = unsaved && Date.now() - since >= REMIND_AFTER_DAYS * DAY && Date.now() >= (meta.snoozedUntil ?? 0);
    this.reminder.set(due);
  }

  private readMeta(): Meta {
    try {
      return JSON.parse(localStorage.getItem(META_KEY) ?? '{}') as Meta;
    } catch {
      return {};
    }
  }

  private writeMeta(meta: Meta): void {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    } catch {
      /* storage blocked: the reminder simply cannot remember */
    }
  }
}
