import { TPipe } from '../../core/i18n/t.pipe';
import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SearchResult, SearchService } from './search.service';

/** Search palette: opens with "/" or Ctrl/Cmd+K, results link to the exact passage. */
@Component({
  selector: 'app-search-dialog',
  imports: [TPipe],
  templateUrl: './search-dialog.component.html',
  styleUrl: './search-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onKey($event)' },
})
export class SearchDialogComponent {
  search = inject(SearchService);
  private router = inject(Router);

  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  query = signal('');
  active = signal(0);
  results = computed<SearchResult[]>(() => {
    this.search.indexing(); // recompute once the index is ready
    return this.search.search(this.query());
  });

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.search.isOpen() && !el.open) {
        el.showModal();
        this.query.set('');
        this.active.set(0);
        setTimeout(() => this.input().nativeElement.focus());
      } else if (!this.search.isOpen() && el.open) {
        el.close();
      }
    });
  }

  onKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing = !!target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    const isShortcut = (event.key === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey);
    if (isShortcut) {
      event.preventDefault();
      this.search.open();
    }
  }

  onInput(value: string): void {
    this.query.set(value);
    this.active.set(0);
  }

  onInputKey(event: KeyboardEvent): void {
    const count = this.results().length;
    if (event.key === 'ArrowDown' && count) {
      event.preventDefault();
      this.active.update(i => (i + 1) % count);
      this.scrollActive();
    } else if (event.key === 'ArrowUp' && count) {
      event.preventDefault();
      this.active.update(i => (i - 1 + count) % count);
      this.scrollActive();
    } else if (event.key === 'Enter') {
      const result = this.results()[this.active()];
      if (result) {
        event.preventDefault();
        this.go(result);
      }
    }
  }

  go(result: SearchResult): void {
    this.search.close();
    void this.router.navigate(['/courses', result.courseId], { fragment: result.headingId });
  }

  /** The native dialog closes itself on Escape; keep the service in sync. */
  onClosed(): void {
    this.search.close();
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.search.close();
  }

  private scrollActive(): void {
    setTimeout(() => document.getElementById(`sr-${this.active()}`)?.scrollIntoView({ block: 'nearest' }));
  }
}
