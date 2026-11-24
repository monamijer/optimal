import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Course } from '../../features/courses/models/course.model';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../features/courses/services/course.service';
import { ProgressService } from '../../core/services/progress.service';

@Component({
  selector: 'app-course-card',
  imports: [RouterLink],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.css'
})
export class CourseCardComponent {
  course = input.required<Course>();
  auth = inject(AuthService);
  progress = inject(ProgressService);
  accent = computed(() => this.courseService.accentOf(this.course().id));
  private courseService = inject(CourseService);
}
