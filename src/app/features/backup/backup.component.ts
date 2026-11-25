import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ProgressService } from '../../core/services/progress.service';
import { NotebookService } from '../notebook/notebook.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { TPipe } from '../../core/i18n/t.pipe';
import { BackupError, BackupFile, BackupService, BackupSummary, ImportMode } from './backup.service';

@Component({
  selector: 'app-backup',
  imports: [TPipe],
  templateUrl: './backup.component.html',
  styleUrl: './backup.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackupComponent implements OnInit {
  backup = inject(BackupService);
  private progress = inject(ProgressService);
  private notebook = inject(NotebookService);

  courses = computed(() => Object.keys(this.progress.all()).length);
  highlights = this.notebook.count;
  hasData = computed(() => this.courses() > 0 || this.highlights() > 0);

  pending = signal<{ backup: BackupFile; summary: BackupSummary } | null>(null);
  mode = signal<ImportMode>('merge');
  message = signal<{ kind: 'ok' | 'error'; key: string } | null>(null);
  readonly i18n = inject(I18nService);

  /** Date and time in the active language. */
  fmt(d: Date | string | number): string {
    return new Intl.DateTimeFormat(this.i18n.locale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));
  }
  busy = signal(false);

  ngOnInit(): void {
    void this.backup.checkPersistence();
  }

  async export(): Promise<void> {
    this.busy.set(true);
    try {
      await this.backup.exportToFile();
      this.message.set({ kind: 'ok', key: 'bk.msg.saved' });
    } finally {
      this.busy.set(false);
    }
  }

  async choose(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    this.pending.set(null);
    if (!file) return;
    try {
      this.pending.set(await this.backup.parse(file));
      this.message.set(null);
    } catch (e) {
      this.message.set({ kind: 'error', key: e instanceof BackupError ? e.message : 'bk.err.damaged' });
    }
  }

  async confirm(): Promise<void> {
    const p = this.pending();
    if (!p) return;
    this.busy.set(true);
    try {
      await this.backup.restore(p.backup, this.mode());
      this.pending.set(null);
      this.message.set({ kind: 'ok', key: this.mode() === 'merge' ? 'bk.msg.merged' : 'bk.msg.replaced' });
    } catch {
      this.message.set({ kind: 'error', key: 'bk.msg.failed' });
    } finally {
      this.busy.set(false);
    }
  }

  cancel(): void {
    this.pending.set(null);
  }

  setMode(mode: ImportMode): void {
    this.mode.set(mode);
  }
}
