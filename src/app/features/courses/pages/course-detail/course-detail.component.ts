import { Component, inject, signal, AfterViewInit, DestroyRef, computed, OnDestroy } from '@angular/core';
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

  course = signal<Course | undefined>(undefined);
  private courseId: string | null = null;

  search = signal('');
  readingProgress = signal(0);
  sections = signal<CourseSection[]>([]);
  currentChapterIndex = signal(0);
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

      setTimeout(() => {
        this.observeCurrentChapter();
        // A search result or shared URL may point to a heading in another chapter.
        const target = this.route.snapshot.fragment;
        if (target) this.scrollTo(target);
      });
    });
  }

  ngAfterViewInit(): void {
    this.route.fragment.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((fragment): fragment is string => !!fragment && !this.isLoading())
    ).subscribe(fragment => setTimeout(() => this.scrollTo(fragment)));

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
    if (this.courseId && !this.isLoading()) {
      this.progress.record(this.courseId, this.readingProgress());
    }
    this.outlineService.clear();
  }

  /** Switches the visible chapter without making another HTTP request. */
  openChapter(chapterId: string): void {
    const index = this.sections().findIndex(section => section.id === chapterId);
    if (index < 0) return;

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

    if (targetIndex < 0) return;

    if (targetIndex !== this.currentChapterIndex()) {
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

  private observeCurrentChapter(): void {
    const section = this.currentSection();
    if (!section) return;

    const ids = this.markdown.getHeadings(section.content).map(heading => heading.id);
    if (ids.length) this.scrollSpy.observe(ids);
  }
}
