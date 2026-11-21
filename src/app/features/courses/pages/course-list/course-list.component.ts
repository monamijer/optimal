import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';
import { CourseCardComponent } from '../../../../shared/course-card/course-card.component';

@Component({
  selector: 'app-course-list',
  imports: [RouterLink, CourseCardComponent],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css',
})
export class CourseListComponent {
  private courseService = inject(CourseService);
  private route = inject(ActivatedRoute);

  allCourses = this.courseService.courses;
  query = toSignal(this.route.queryParamMap.pipe(map(p => (p.get('q') ?? '').trim())), { initialValue: '' });

  courses = computed(() => {
    const q = this.normalize(this.query());
    if (!q) return this.allCourses();
    return this.allCourses().filter(c =>
      this.normalize([c.title, c.description, c.category ?? '', ...(c.tags ?? [])].join(' ')).includes(q));
  });

  groups = computed(() => {
    const map = new Map<string, Course[]>();
    for (const course of this.courses()) {
      const name = course.category ?? 'Autres cours';
      map.set(name, [...(map.get(name) ?? []), course]);
    }
    return [...map].map(([name, courses]) => ({ name, courses }));
  });

  private normalize(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
}
