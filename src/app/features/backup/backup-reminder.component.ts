import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackupService } from './backup.service';

/** Quiet reminder: shown only when there are unsaved changes and the last backup is old. */
@Component({
  selector: 'app-backup-reminder',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (backup.reminder()) {
      <aside class="reminder" aria-label="Rappel de sauvegarde">
        <p>Vos notes et votre progression n'existent que dans ce navigateur. Une sauvegarde prend 10 secondes.</p>
        <a routerLink="/backup" class="go">Sauvegarder</a>
        <button type="button" (click)="backup.snooze()">Plus tard</button>
      </aside>
    }
  `,
  styles: `
    .reminder { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem 1rem; margin: 0 0 1rem; padding: .6rem .9rem; background: var(--marker-soft); border-left: 5px solid var(--marker); border-radius: 6px; }
    p { margin: 0; flex: 1 1 18rem; font: 500 .93rem var(--font-ui); color: var(--ink); }
    .go, button { min-height: 40px; display: inline-flex; align-items: center; padding: 0 .9rem; border-radius: 6px; font: 700 .9rem var(--font-ui); cursor: pointer; }
    .go { background: var(--ink); color: var(--paper); border: 2px solid var(--ink); text-decoration: none; }
    button { background: transparent; color: var(--ink); border: 2px solid var(--line); }
    .go:focus-visible, button:focus-visible { outline: 3px solid var(--pen); outline-offset: 2px; }
  `,
})
export class BackupReminderComponent {
  backup = inject(BackupService);
}
