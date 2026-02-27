import { Component, computed, inject, signal } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { MarkdownService } from '../../../../core/services/markdown.service';
import { ScrollspyService } from '../../../../core/services/scrollspy.service';
import { CourseSection } from '../../models/courseSection.model';
import { CourseSectionComponent } from '../../course-section/course-section.component';
import { SHARED_IMPORTS } from '../../../../models/shared.imports';

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
  content$ = this.courseService.loadMarkdown(
      `assets/courses/${this.route.snapshot.paramMap.get('id')}.md`
);

  sections$ = this.content$.pipe(
    map(content=> splitSections(content))
  );

  filteredSection$ = this.sections$.pipe(
    map(sections => sections.filter(section =>
      section.content.toLowerCase().includes(this.search().toLowerCase())
    ))
  );


  headings$ = this.sections$.pipe(
    map(sections => this.markdown.getHeadings(sections.map(s=> s.content).join('\n')))
  );

  ngAfterViewInit(): void {
    this.headings().subscribe(headings => {
      this.scrollSpy.observe(
        headings.map(h=> h.id)
      );
  }

  private splitSections(raw: string): CourseSection[] {
    if(!raw) return [];
    const parts = raw.split('\n## ');
    return parts.map((part, index) => {
      const titleMatch = part.match(/^(.+)/);
      const title = index === 0 ? 'Introduction' : ? titleMatch.[1] ?? `Section ${index}`;
      return {
        id: title.toLowerCase().replace(/\+/g, '-'),
        title,
        content: index === 0 ? part : '## ' + part
      };
    });
  }

}

