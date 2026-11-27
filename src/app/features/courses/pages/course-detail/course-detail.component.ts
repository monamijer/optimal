import { Component, inject, signal, AfterViewInit, DestroyRef, computed, OnDestroy, effect } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { HighlighterComponent } from '../../../notebook/highlighter.component';
import { CourseService } from '../../services/course.service';
import { MarkdownService } from '../../../../core/services/markdown.service';
import { ScrollspyService } from '../../../../core/services/scrollspy.service';
import { CourseSection } from '../../models/courseSection.model';
import { CourseSectionComponent } from '../../course-section/course-section.component';
import { TPipe } from '../../../../core/i18n/t.pipe';
import { SHARED_IMPORTS } from '../../../../models/shared.imports';
import { combineLatest, from, fromEvent } from 'rxjs';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { map, filter, switchMap, auditTime } from 'rxjs/operators';
import { CourseOutlineService } from '../../../../core/services/course-outline.service';
import { ProgressService } from '../../../../core/services/progress.service';
import { Course } from '../../models/course.model';
import { QuizAttemptService, firstLockedChapter, chapterStatus, PASS_RATIO } from '../../../../core/services/quiz-attempt.service';

@Component({
  selector: 'app-course-detail',
  imports: [TPipe, HighlighterComponent, CourseSectionComponent, SHARED_IMPORTS, RouterModule],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private destroyRef = inject(DestroyRef);
  private markdown = inject(MarkdownService);
  public scrollSpy = inject(ScrollspyService);
  private outlineService = inject(CourseOutlineService);
  progress = inject(ProgressService);
  private i18n = inject(I18nService);
  private attempts = inject(QuizAttemptService);

  course = signal<Course | undefined>(undefined);
  private courseId: string | null = null;

  search = signal('');
  readingProgress = signal(0);
  sections = signal<CourseSection[]>([]);
  currentChapterIndex = signal(0);
  /** Clock for the 24 h gate, refreshed every minute so a chapter opens while the page stays open. */
  private now = signal(Date.now());
  private tick = setInterval(() => this.now.set(Date.now()), 60_000);
  gateNotice = signal<string | null>(null);

  /** Number of quiz blocks per chapter. */
  private quizCounts = computed(() => this.sections().map(s => ({ id: s.id, quizzes: this.markdown.extractQuizzes(s.content).length })));

  /** Index of the first chapter still locked by the quiz gate. */
  lockedFrom = computed(() => {
    const id = this.course()?.id;
    const list = this.quizCounts();
    if (!id) return list.length;
    return firstLockedChapter(list, ch => this.attempts.get(id, ch), this.now());
  });

  /** Quiz progress of the selected chapter, or null when it has no quiz. */
  gate = computed((): { key: string; params: Record<string, string | number>; tone: 'todo' | 'ok' | 'bad' } | null => {
    const id = this.course()?.id;
    const sec = this.currentSection();
    if (!id || !sec) return null;
    const total = this.quizCounts()[this.currentChapterIndex()]?.quizzes ?? 0;
    if (!total) return null;
    const status = chapterStatus(this.attempts.get(id, sec.id), this.now());
    const fmt = (t: number) => new Date(t).toLocaleString(this.i18n.locale(), { dateStyle: 'medium', timeStyle: 'short' });
    switch (status.kind) {
      case 'none': return { key: 'gate.todo', params: { n: total, count: total }, tone: 'todo' };
      case 'open': return { key: 'gate.open', params: { done: status.answered, n: total }, tone: 'todo' };
      case 'passed': return { key: 'gate.passedOpen', params: { pct: Math.round(status.score * 100) }, tone: 'ok' };
      case 'failed': return { key: 'gate.failed', params: { pct: Math.round(status.score * 100), need: Math.round(PASS_RATIO * 100), when: fmt(status.retakeAt) }, tone: 'bad' };
    }
  });

  /** When the chapter after the selected one opens, or null when it is open (or there is none). */
  nextLocked = computed(() => this.currentChapterIndex() + 1 >= this.lockedFrom() && this.currentChapterIndex() + 1 < this.sections().length);

  isLoading = computed(() => this.sections().length === 0);

  /** Only the selected chapter is rendered; all chapters remain cached in memory. */
  currentSection = computed(() => this.sections()[this.currentChapterIndex()] ?? null);

  /** Chapters in reading order with their display title (first H1, else the file name). */
  chapters = computed(() =>
    this.sections().map(sec => {
      const headings = this.markdown.getHeadings(sec.content);
      return { id: sec.id, title: headings.find(h => h.level === 1)?.text ?? sec.title, headings };
    })
  );

  currentChapter = computed(() => this.chapters()[this.currentChapterIndex()] ?? null);

  /** Previous/next chapter around a given chapter. */
  neighbours(id: string) {
    const list = this.chapters();
    const i = list.findIndex(c => c.id === id);
    return {
      prev: i > 0 ? list[i - 1] : null,
      next: i >= 0 && i < list.length - 1 ? list[i + 1] : null
    };
  }

  /** Headings of the selected chapter only. */
  tocHeadings = computed(() =>
    (this.currentChapter()?.headings ?? []).filter(h => h.level > 1)
  );

  /** Headings currently present in the DOM, used by the scrollspy. */
  headings = computed(() =>
    this.currentSection()
      ? this.markdown.getHeadings(this.currentSection()!.content)
      : []
  );

  /** Rough reading time at 200 words per minute. */
  readingMinutes = computed(() => {
    const words = this.sections().reduce((n, s) => n + (s.content.match(/\S+/g)?.length ?? 0), 0);
    return Math.max(1, Math.round(words / 200));
  });

  accent = computed(() => {
    const id = this.course()?.id;
    return id ? this.courseService.accentOf(id) : 0;
  });

  allDone = computed(() => {
    const id = this.course()?.id;
    const total = this.sections().length;
    return !!id && total > 0 && this.progress.completedCount(id) >= total;
  });

  toggleDone(chapterId: string): void {
    if (this.courseId) this.progress.toggleChapter(this.courseId, chapterId);
  }

  constructor() {
    // The sidebar shows which chapters are locked; a restored backup may also lock the chapter being read.
    effect(() => {
      const id = this.courseId;
      const locked = this.lockedFrom();
      const chapters = this.chapters();
      if (id && chapters.length) this.outlineService.set({ courseId: id, chapters, lockedFrom: locked });
      if (this.currentChapterIndex() >= locked && locked > 0) this.currentChapterIndex.set(locked - 1);
    });
    // Reload chapters when the route or active language changes.
    combineLatest([this.route.paramMap, toObservable(this.i18n.lang)]).pipe(
      takeUntilDestroyed(this.destroyRef),
      map(([params]: [ParamMap, string]) => params.get('id')),
      filter((id): id is string => !!id),
      switchMap(id => {
        this.courseId = id;
        this.course.set(this.courseService.getCourseById(id));
        this.outlineService.clear();
        this.progress.record(id, 0);
        this.sections.set([]);
        this.currentChapterIndex.set(0);
        this.scrollSpy.reset();
        return from(this.courseService.loadCourse(id));
      })
    ).subscribe(sections => {
      this.sections.set(sections);

      if (this.courseId) {
        this.outlineService.set({
          courseId: this.courseId,
          chapters: this.chapters()
        });
      }

      // Stored quiz answers decide which chapters are open, so wait for them before following a link.
      void this.attempts.ready.then(() => setTimeout(() => {
        this.observeCurrentChapter();
        // A search result or shared URL may point to a heading in another chapter.
        const target = this.route.snapshot.fragment;
        if (target) this.scrollTo(target);
      }));
    });
  }

  ngAfterViewInit(): void {
    this.route.fragment.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((fragment): fragment is string => !!fragment && !this.isLoading())
    ).subscribe(fragment => void this.attempts.ready.then(() => setTimeout(() => this.scrollTo(fragment))));

    fromEvent(window, 'scroll').pipe(
      takeUntilDestroyed(this.destroyRef),
      map(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      })
    ).subscribe(progress => this.readingProgress.set(progress));

    // Save reading progress periodically while the student reads.
    fromEvent(window, 'scroll').pipe(
      takeUntilDestroyed(this.destroyRef),
      auditTime(1000)
    ).subscribe(() => {
      if (this.courseId && !this.isLoading()) {
        this.progress.record(this.courseId, this.readingProgress());
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.tick);
    if (this.courseId && !this.isLoading()) {
      this.progress.record(this.courseId, this.readingProgress());
    }
    this.outlineService.clear();
  }

  /** Switches the visible chapter without making another HTTP request. */
  openChapter(chapterId: string): void {
    const index = this.sections().findIndex(section => section.id === chapterId);
    if (index < 0 || this.blocked(index)) return;
    this.gateNotice.set(null);

    this.currentChapterIndex.set(index);
    this.scrollSpy.reset();

    setTimeout(() => {
      this.observeCurrentChapter();
      document.getElementById(chapterId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }

  /** Opens the chapter containing a heading, then scrolls to that heading. */
  scrollTo(id: string): void {
    const targetIndex = this.sections().findIndex(section =>
      section.id === id || this.markdown.getHeadings(section.content).some(heading => heading.id === id)
    );

    if (targetIndex < 0 || this.blocked(targetIndex)) return;

    if (targetIndex !== this.currentChapterIndex()) {
      this.gateNotice.set(null);
      this.currentChapterIndex.set(targetIndex);
      this.scrollSpy.reset();
      setTimeout(() => {
        this.observeCurrentChapter();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** True (and a notice is shown) when the quiz gate keeps this chapter closed. */
  private blocked(index: number): boolean {
    if (index < this.lockedFrom()) return false;
    this.gateNotice.set('gate.locked');
    return true;
  }

  private observeCurrentChapter(): void {
    const section = this.currentSection();
    if (!section) return;

    const ids = this.markdown.getHeadings(section.content).map(heading => heading.id);
    if (ids.length) this.scrollSpy.observe(ids);
  }
}
