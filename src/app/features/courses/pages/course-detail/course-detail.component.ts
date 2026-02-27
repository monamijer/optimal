import { Component, inject, signal, effect, AfterViewInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { MarkdownService } from '../../../../core/services/markdown.service';
import { ScrollspyService } from '../../../../core/services/scrollspy.service';
import { CourseSection } from '../../models/courseSection.model';
import { CourseSectionComponent } from '../../course-section/course-section.component';
import { SHARED_IMPORTS } from '../../../../models/shared.imports';
import { fromEvent } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, filter, switchMap } from 'rxjs/operators'

@Component({
  selector: 'app-course-detail',
  imports: [CourseSectionComponent, SHARED_IMPORTS],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements AfterViewInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private markdown = inject(MarkdownService);

  public scrollSpy = inject(ScrollspyService);

  search = signal('');
  content$ = this.route.paramMap.pipe(
    map((params: ParamMap )=> params.get('id')),
    filter((id): id is string => !!id),

    switchMap(id=>
      this.courseService.loadCourse(id))
  );

  sections$ = this.content$.pipe(
    map(raw => this.splitSections(raw))
  );

  filteredSections$ = this.sections$.pipe(
    map((sections: CourseSection[]) => sections.filter(section =>
      section.content.toLowerCase().includes(this.search().toLowerCase())
    ))
  );

   readingProgress = signal(0);

  headings$ = this.sections$.pipe(
    map((sections: CourseSection[]) => this.markdown.getHeadings(sections.map(s=> s.content).join('\n')))
  );

  private splitSections(raw: string): CourseSection[] {
    if(!raw) return [];
    const parts = raw.split('\n## ');
    return parts.map((part: string, index: number) => {
      const titleMatch = part.match(/^(.+)/);
      const title = index === 0 ? 'Introduction' : titleMatch?.[1] ?? `Section ${index}`;
      return {
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        content: index === 0 ? part : '## ' + part
      };
    })
  }
  ngAfterViewInit(): void {
     fromEvent(window, 'scroll').pipe(
       map(()=>{
         const scrollTop = window.scrollY;
         const docHeight = document
                .documentElement.scrollHeight - window.innerHeight;
          return (scrollTop/docHeight) * 100;
       })

   ).subscribe(this.readingProgress);
    this.headings$.subscribe(headings => {
      this.scrollSpy.observe(
        headings.map(h=> h.id)
      );
  });
  }

}
