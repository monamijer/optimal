import { TPipe } from '../../../../core/i18n/t.pipe';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';
import { ProgressService } from '../../../../core/services/progress.service';
import { CourseCardComponent } from '../../../../shared/course-card/course-card.component';

@Component({
  selector: 'app-course-list',
  imports: [TPipe, RouterLink, CourseCardComponent],
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.css',
})
export class CourseListComponent {
  private courseService = inject(CourseService);
  private route = inject(ActivatedRoute);
  private progress = inject(ProgressService);

  readonly filters = [
    { id: 'all', key: 'list.fAll' },
    { id: 'free', key: 'list.fFree' },
    { id: 'started', key: 'list.fStarted' },
  ] as const;
  filter = signal<'all' | 'free' | 'started'>('all');

  allCourses = this.courseService.courses;
  query = toSignal(this.route.queryParamMap.pipe(map(p => (p.get('q') ?? '').trim())), { initialValue: '' });

  courses = computed(() => {
    const q = this.normalize(this.query());
    const mode = this.filter();
    return this.allCourses().filter(c =>
      (mode === 'all' || (mode === 'free' ? c.accessLevel === 'free' : !!this.progress.get(c.id))) &&
      (!q || this.normalize([c.title, c.description, c.category ?? '', ...(c.tags ?? [])].join(' ')).includes(q)));
  });

  groups = computed(() => {
    const map = new Map<string, Course[]>();
    for (const course of this.courses()) {
      const name = course.category ? 'cat.' + course.category : 'cat.other';
      map.set(name, [...(map.get(name) ?? []), course]);
    }
    return [...map].map(([name, courses]) => ({ name, courses }));
  });

  private normalize(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
}
