import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProgressService } from '../../core/services/progress.service';
import { CourseService } from '../courses/services/course.service';
import { CuriosityComponent } from './curiosity.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CuriosityComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  auth = inject(AuthService);
  progress = inject(ProgressService);
  private courseService = inject(CourseService);

  courses = this.courseService.courses;
  chapterCount = computed(() => this.courses().reduce((n, c) => n + (c.chapters?.length ?? 0), 0));

  /** Phrases the visitor highlighted in the hero demo (nothing is saved). */
  marked = signal<ReadonlySet<number>>(new Set());
  isOn(i: number): boolean { return this.marked().has(i); }
  toggle(i: number): void {
    this.marked.update(set => {
      const next = new Set(set);
      if (!next.delete(i)) next.add(i);
      return next;
    });
  }
  firstFree = computed(() => this.courses().find(c => c.accessLevel === 'free') ?? this.courses()[0]);

  /** Last course the learner opened, with the progress saved in this browser. */
  resume = computed(() => {
    const last = this.progress.last();
    const course = last ? this.courseService.getCourseById(last.courseId) : undefined;
    return last && course ? { course, percent: last.percent } : null;
  });
}
