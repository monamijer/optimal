import { TPipe } from '../../core/i18n/t.pipe';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotebookService } from './notebook.service';
import { CourseService } from '../courses/services/course.service';

@Component({
  selector: 'app-notebook',
  imports: [TPipe, RouterLink],
  templateUrl: './notebook.component.html',
  styleUrl: './notebook.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotebookComponent {
  notebook = inject(NotebookService);
  private courses = inject(CourseService);

  groups = computed(() => {
    const map = new Map<string, ReturnType<NotebookService['forCourse']>>();
    for (const h of this.notebook.items()) map.set(h.courseId, [...(map.get(h.courseId) ?? []), h]);
    return [...map].map(([courseId, items]) => ({
      courseId,
      title: this.courses.getCourseById(courseId)?.title ?? courseId,
      items,
    }));
  });

  saveNote(id: string, value: string): void {
    this.notebook.update(id, { note: value.trim() });
  }
}
