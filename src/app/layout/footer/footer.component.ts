import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../features/courses/services/course.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  auth = inject(AuthService);
  courses = inject(CourseService).getAllCourses();
  year = new Date().getFullYear();

  toTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
