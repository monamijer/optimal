import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ProgressService } from '../../core/services/progress.service';
import { NotebookService } from '../notebook/notebook.service';
import { BackupError, BackupFile, BackupService, BackupSummary, ImportMode } from './backup.service';

@Component({
  selector: 'app-backup',
  imports: [DatePipe],
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
  message = signal<{ kind: 'ok' | 'error'; text: string } | null>(null);
  busy = signal(false);

  ngOnInit(): void {
    void this.backup.checkPersistence();
  }

  async export(): Promise<void> {
    this.busy.set(true);
    try {
      await this.backup.exportToFile();
      this.message.set({ kind: 'ok', text: 'Sauvegarde téléchargée. Gardez le fichier dans un endroit sûr (Drive, clé USB, e-mail à vous-même).' });
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
      this.message.set({ kind: 'error', text: e instanceof BackupError ? e.message : 'Impossible de lire ce fichier.' });
    }
  }

  async confirm(): Promise<void> {
    const p = this.pending();
    if (!p) return;
    this.busy.set(true);
    try {
      await this.backup.restore(p.backup, this.mode());
      this.pending.set(null);
      this.message.set({ kind: 'ok', text: this.mode() === 'merge' ? 'Sauvegarde fusionnée avec vos données.' : 'Vos données ont été remplacées par la sauvegarde.' });
    } catch {
      this.message.set({ kind: 'error', text: "L'import a échoué. Vos données actuelles n'ont pas été supprimées si l'erreur est survenue avant l'écriture." });
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
