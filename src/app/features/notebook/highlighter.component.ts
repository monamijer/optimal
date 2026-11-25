import { TPipe } from '../../core/i18n/t.pipe';
import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, signal } from '@angular/core';
import { NotebookService } from './notebook.service';
import { clearHighlights, headingBefore, wrapQuote } from './highlight-dom';

interface Draft {
  mode: 'new' | 'note' | 'edit';
  id?: string;
  quote: string;
  chapterId: string;
  headingId: string;
  note: string;
  top: number;
  left: number;
}

/**
 * Lets the reader highlight a passage of the course and attach a note.
 * Stored in the learner's own data, never in the course content.
 */
@Component({
  selector: 'app-highlighter',
  imports: [TPipe],
  templateUrl: './highlighter.component.html',
  styleUrl: './highlighter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:mouseup)': 'onPointerEnd($event)',
    '(document:keyup)': 'onKeyUp($event)',
    '(document:keydown.escape)': 'draft.set(null)',
    '(document:click)': 'onClick($event)',
    '(window:scroll)': 'onScroll()',
  },
})
export class HighlighterComponent {
  private notebook = inject(NotebookService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  courseId = input.required<string>();
  /** Changes whenever the chapters are (re)rendered, so highlights are drawn again. */
  renderKey = input<unknown>(null);

  draft = signal<Draft | null>(null);

  constructor() {
    effect(() => {
      this.renderKey();
      this.notebook.items();
      const courseId = this.courseId();
      // Wait for the chapters to be in the DOM
      setTimeout(() => this.paint(courseId), 120);
    });
  }

  save(withNote: boolean): void {
    const d = this.draft();
    if (!d) return;
    if (d.mode === 'edit' && d.id) {
      this.notebook.update(d.id, { note: d.note.trim() });
    } else {
      this.notebook.add({ courseId: this.courseId(), chapterId: d.chapterId, headingId: d.headingId, quote: d.quote, note: withNote ? d.note.trim() : '' });
    }
    window.getSelection()?.removeAllRanges();
    this.draft.set(null);
  }

  openNote(): void {
    this.draft.update(d => (d ? { ...d, mode: 'note' } : d));
  }

  remove(): void {
    const d = this.draft();
    if (d?.id) this.notebook.remove(d.id);
    this.draft.set(null);
  }

  setNote(value: string): void {
    this.draft.update(d => (d ? { ...d, note: value } : d));
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.altKey && event.key.toLowerCase() === 'h') {
      if (this.draft()?.mode === 'new') this.save(false);
      return;
    }
    if (event.key.startsWith('Shift') || event.key.startsWith('Arrow')) this.readSelection();
  }

  onPointerEnd(event: MouseEvent): void {
    if (this.host.nativeElement.contains(event.target as Node)) return;
    setTimeout(() => this.readSelection());
  }

  onClick(event: MouseEvent): void {
    const el = event.target as HTMLElement;
    const mark = el.closest?.('mark[data-hl]') as HTMLElement | null;
    if (!mark || !window.getSelection()?.isCollapsed) return;
    const item = this.notebook.items().find(h => h.id === mark.getAttribute('data-hl'));
    if (!item) return;
    const rect = mark.getBoundingClientRect();
    this.draft.set({ mode: 'edit', id: item.id, quote: item.quote, chapterId: item.chapterId, headingId: item.headingId, note: item.note, ...this.place(rect) });
  }

  onScroll(): void {
    // Selection toolbars follow the text, so just hide them once the page moves
    if (this.draft()?.mode === 'new') this.draft.set(null);
  }

  private readSelection(): void {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      if (this.draft()?.mode === 'new') this.draft.set(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const startEl = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement) as HTMLElement | null;
    const chapter = startEl?.closest<HTMLElement>('section.doc-section');
    const endEl = (range.endContainer.nodeType === 1 ? range.endContainer : range.endContainer.parentElement) as HTMLElement | null;
    const quote = range.toString().replace(/\s+/g, ' ').trim();
    if (!chapter || !chapter.contains(endEl) || quote.length < 2 || quote.length > 600 || !chapter.closest('.course-main')) {
      if (this.draft()?.mode === 'new') this.draft.set(null);
      return;
    }
    this.draft.set({
      mode: 'new', quote, chapterId: chapter.id, headingId: headingBefore(chapter, range.startContainer), note: '',
      ...this.place(range.getBoundingClientRect()),
    });
  }

  private place(rect: DOMRect): { top: number; left: number } {
    const top = rect.top > 90 ? rect.top - 52 : rect.bottom + 8;
    const left = Math.min(Math.max(8, rect.left + rect.width / 2 - 140), window.innerWidth - 296);
    return { top, left };
  }

  private paint(courseId: string): void {
    const byChapter = new Map<string, ReturnType<NotebookService['forCourse']>>();
    for (const h of this.notebook.forCourse(courseId)) byChapter.set(h.chapterId, [...(byChapter.get(h.chapterId) ?? []), h]);
    document.querySelectorAll<HTMLElement>('.course-main section.doc-section').forEach(section => {
      clearHighlights(section);
      for (const h of byChapter.get(section.id) ?? []) wrapQuote(section, h.quote, h.id, h.note);
    });
  }
}
