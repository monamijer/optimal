import { TPipe } from '../../core/i18n/t.pipe';
import { QuizReviewService } from '../../core/services/quiz-review.service';
import { Component, ElementRef, HostListener, computed, effect, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../core/services/layout.service';
import { CourseOutlineService } from '../../core/services/course-outline.service';
import { ScrollspyService } from '../../core/services/scrollspy.service';
import { ProgressService } from '../../core/services/progress.service';
import { NotebookService } from '../../features/notebook/notebook.service';
import { CourseService } from '../../features/courses/services/course.service';
import { Course } from '../../features/courses/models/course.model';
import { AuthService } from '../../services/auth.service';

interface CourseGroup { name: string; courses: Course[]; }

/**
 * Course navigation: category > course > chapters > sections of the open course.
 * Desktop: collapsible column. Mobile/tablet: modal drawer.
 */
@Component({
  selector: 'app-sidebar',
  imports: [TPipe, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  layout = inject(LayoutService);
  auth = inject(AuthService);
  progress = inject(ProgressService);
  notebook = inject(NotebookService);
  private quizReview = inject(QuizReviewService);
  reviewDue = computed(() => this.quizReview.due().length);
  private outlineService = inject(CourseOutlineService);
  private scrollSpy = inject(ScrollspyService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private courses = inject(CourseService).courses;
  private opener: HTMLElement | null = null;

  outline = this.outlineService.outline;

  groups = computed<CourseGroup[]>(() => {
    const map = new Map<string, Course[]>();
    for (const course of this.courses()) {
      const name = course.category ? 'cat.' + course.category : 'cat.other';
      map.set(name, [...(map.get(name) ?? []), course]);
    }
    return [...map].map(([name, courses]) => ({ name, courses }));
  });

  /** Chapter that contains the section currently being read. */
  currentChapter = computed(() => {
    const outline = this.outline();
    if (!outline) return null;
    const active = this.scrollSpy.activeId();
    const hit = outline.chapters.find(c => c.headings.some(h => h.id === active));
    return (hit ?? outline.chapters[0])?.id ?? null;
  });

  constructor() {
    // Focus management for the modal drawer
    effect(() => {
      if (this.layout.modalOpen()) {
        this.opener = document.activeElement as HTMLElement | null;
        setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>('.side-close')?.focus(), 0);
      } else if (this.opener) {
        this.opener.focus?.();
        this.opener = null;
      }
    });
  }

  goTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.layout.closeSidebar();
  }

  close(): void {
    this.layout.closeSidebar();
  }

  logout(): void {
    this.auth.logout();
    this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.layout.closeSidebar();
  }

  /** Keep Tab inside the drawer while it is modal. */
  @HostListener('keydown.tab', ['$event'])
  @HostListener('keydown.shift.tab', ['$event'])
  trapFocus(event: Event): void {
    if (!this.layout.modalOpen()) return;
    const items = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const e = event as KeyboardEvent;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}
