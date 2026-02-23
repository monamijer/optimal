import { Component, computed, inject, signal } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { MarkdownService } from '../../../../core/services/markdown.service';
import { ScrollspyService } from '../../../../core/services/scrollspy.service';
import { CourseSection } from '../../models/courseSection.model';
import { CourseSectionComponent } from '../../course-section/course-section.component';

@Component({
  selector: 'app-course-detail',
  imports: [CourseSectionComponent],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements AfterViewInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private markdown = inject(MarkdownService);
  public scrollSpy = inject(ScrollspyService);

  sections = signal<CourseSection[]>([]);

  constructor(){
    const id = this.route.snapshot.paramMap.get('id');

    if(id){
      const course = this.courseService.getCourseById(id);

      if(course){
        const sections = this.courseService.getSectionsByKey(course.title);
        this.sections.set(sections);
      }
    }
  }
  ngAfterViewInit(): void {
      this.scrollSpy.observe(
        this.headings().map(h=> h.id)
      );
  }
  headings = computed(()=>
    this.markdown.getHeadings(
      this.sections().map(s=> s.content).join('\n')
    )
  );
 search = signal('');

 filteredSections = computed(()=>
   this.sections().filter(section =>
      section.content
        .toLowerCase()
        .includes(this.search().toLowerCase())

  )
);
}

