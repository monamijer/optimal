import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProgressService } from '../../core/services/progress.service';
import { CourseService } from '../courses/services/course.service';
import { CourseCardComponent } from '../../shared/course-card/course-card.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CourseCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  auth = inject(AuthService);
  private progress = inject(ProgressService);
  private courseService = inject(CourseService);

  courses = this.courseService.getAllCourses();
  firstFree = this.courses.find(c => c.accessLevel === 'free') ?? this.courses[0];

  /** Last course the learner opened, with the progress saved in this browser. */
  resume = computed(() => {
    const last = this.progress.last();
    const course = last ? this.courseService.getCourseById(last.courseId) : undefined;
    return last && course ? { course, percent: last.percent } : null;
  });
}
