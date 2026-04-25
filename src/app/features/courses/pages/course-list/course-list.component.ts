import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { CourseSection } from '../../models/courseSection.model';
import { CourseSectionComponent } from '../../course-section/course-section.component';
import { CourseSectionService } from '../../services/course-section.service';
import { RouterLink } from "@angular/router";
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-course-list',
  imports: [CourseSectionComponent, RouterLink],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css',
})
export class CourseListComponent {
  private courseService = inject(CourseService);
  auth  = inject(AuthService);
  courses = this.courseService.getAllCourses();
}
