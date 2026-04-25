import { Component, inject } from '@angular/core';
import { CourseSectionComponent } from '../../course-section/course-section.component';
import { RouterLink } from "@angular/router";
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-course-list',
  imports: [RouterLink],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css',
})
export class CourseListComponent {
  private courseService = inject(CourseService);
  auth  = inject(AuthService);
  courses = this.courseService.getAllCourses();
}
