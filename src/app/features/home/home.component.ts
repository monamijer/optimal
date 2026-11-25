import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../../core/services/progress.service';
import { MarkdownService } from '../../core/services/markdown.service';
import { CourseCardComponent } from '../../shared/course-card/course-card.component';
import { CourseService } from '../courses/services/course.service';
import { ScaleDemoComponent } from './scale-demo.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CourseCardComponent, ScaleDemoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  progress = inject(ProgressService);
  private courseService = inject(CourseService);

  courses = this.courseService.courses;
  chapterCount = computed(() => this.courses().reduce((n, c) => n + (c.chapters?.length ?? 0), 0));

  /** The heading that explains the demo, in the Algorithms course. */
  readonly explainFragment = inject(MarkdownService).toSlug('Binary search');

  /** Last course the learner opened, with the progress saved in this browser. */
  resume = computed(() => {
    const last = this.progress.last();
    const course = last ? this.courseService.getCourseById(last.courseId) : undefined;
    return last && course ? { course, percent: last.percent } : null;
  });
}
