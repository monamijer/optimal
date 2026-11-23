import { Component, inject, signal, AfterViewInit, DestroyRef, computed, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { MarkdownService } from '../../../../core/services/markdown.service';
import { ScrollspyService } from '../../../../core/services/scrollspy.service';
import { CourseSection } from '../../models/courseSection.model';
import { CourseSectionComponent } from '../../course-section/course-section.component';
import { SHARED_IMPORTS } from '../../../../models/shared.imports';
import { from, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, filter, switchMap, auditTime } from 'rxjs/operators';
import { CourseOutlineService } from '../../../../core/services/course-outline.service';
import { ProgressService } from '../../../../core/services/progress.service';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-course-detail',
  imports: [CourseSectionComponent, SHARED_IMPORTS, RouterModule],
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
  private progress = inject(ProgressService);

  course = signal<Course | undefined>(undefined);
  private courseId: string | null = null;

  search = signal('');
  readingProgress = signal(0);

  // ✅ Signal normal — jamais undefined
  sections = signal<CourseSection[]>([]);
  isLoading = computed(() => this.sections().length === 0);

  filteredSections = computed(() =>
    this.sections().filter(s =>
      s.content.toLowerCase().includes(this.search().toLowerCase())
    )
  );

  headings = computed(() =>
    this.markdown.getHeadings(
      this.sections().map(s => s.content).join('\n')
    )
  );

  constructor() {
    // ✅ Écoute les changements de route et met à jour le signal
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef),
      map((params: ParamMap) => params.get('id')),
      filter((id): id is string => !!id),
      switchMap(id => {
      this.courseId = id;
      this.course.set(this.courseService.getCourseById(id));
      this.outlineService.clear();
      this.progress.record(id, 0);

      // ✅ Reset d'abord pour déclencher le skeleton
      this.sections.set([]);
      this.scrollSpy.reset();
      return from(this.courseService.loadCourse(id));
      })
    ).subscribe(sections => {
      // ✅ Puis set les vraies sections
      this.sections.set(sections);
      if (this.courseId) {
        this.outlineService.set({
          courseId: this.courseId,
          chapters: sections.map(sec => {
            const headings = this.markdown.getHeadings(sec.content);
            const title = headings.find(h => h.level === 1)?.text ?? sec.title;
            return { id: sec.id, title, headings };
          }),
        });
      }
      setTimeout(() => {
        // ✅ Observer les headings après que le DOM soit rendu
        const headings = this.markdown.getHeadings(
          sections.map(s => s.content).join('\n')
        );
        if (headings.length > 0) {
          this.scrollSpy.observe(headings.map(h => h.id));
        }
        // Arrived from a search result or a link with #section: jump to it
        const target = this.route.snapshot.fragment;
        if (target) this.scrollTo(target);
      }, 100);
    });
  }

  ngAfterViewInit(): void {
    // Same course, another section (e.g. a second search result)
    this.route.fragment.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((f): f is string => !!f && !this.isLoading())
    ).subscribe(f => setTimeout(() => this.scrollTo(f)));

    fromEvent(window, 'scroll').pipe(
      takeUntilDestroyed(this.destroyRef),
      map(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      })
    ).subscribe(progress => this.readingProgress.set(progress));

    // Save the reading progress (throttled) so the home page can resume the course
    fromEvent(window, 'scroll').pipe(
      takeUntilDestroyed(this.destroyRef),
      auditTime(1000)
    ).subscribe(() => {
      if (this.courseId && !this.isLoading()) this.progress.record(this.courseId, this.readingProgress());
    });
  }

  ngOnDestroy(): void {
    if (this.courseId && !this.isLoading()) this.progress.record(this.courseId, this.readingProgress());
    this.outlineService.clear();
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}