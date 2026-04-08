import { Component, inject, signal, AfterViewInit, DestroyRef, computed } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { MarkdownService } from '../../../../core/services/markdown.service';
import { ScrollspyService } from '../../../../core/services/scrollspy.service';
import { CourseSection } from '../../models/courseSection.model';
import { CourseSectionComponent } from '../../course-section/course-section.component';
import { SHARED_IMPORTS } from '../../../../models/shared.imports';
import { from, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-course-detail',
  imports: [CourseSectionComponent, SHARED_IMPORTS, RouterModule],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements AfterViewInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private destroyRef = inject(DestroyRef);
  private markdown = inject(MarkdownService);
  public scrollSpy = inject(ScrollspyService);

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

      // ✅ Reset d'abord pour déclencher le skeleton
      this.sections.set([]);
      this.scrollSpy.reset();
      return from(this.courseService.loadCourse(id));
      })
    ).subscribe(sections => {
      // ✅ Puis set les vraies sections
      this.sections.set(sections);
      setTimeout(() => {
        // ✅ Observer les headings après que le DOM soit rendu
        const headings = this.markdown.getHeadings(
          sections.map(s => s.content).join('\n')
        );
        if (headings.length > 0) {
          this.scrollSpy.observe(headings.map(h => h.id));
        }
      }, 100);
    });
  }

  ngAfterViewInit(): void {
    fromEvent(window, 'scroll').pipe(
      takeUntilDestroyed(this.destroyRef),
      map(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      })
    ).subscribe(progress => this.readingProgress.set(progress));
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}