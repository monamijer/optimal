import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CourseSectionComponent } from '../courses/course-section/course-section.component';
import { CourseSection } from '../courses/models/courseSection.model';
import { CourseService } from '../courses/services/course.service';
import { MarkdownService } from '../../core/services/markdown.service';
import { QuizReviewService } from '../../core/services/quiz-review.service';
import { TPipe } from '../../core/i18n/t.pipe';

interface ReviewItem {
  key: string;
  courseId: string;
  courseTitle: string;
  chapterId: string;
  chapterTitle: string;
  index: number;
  section: CourseSection;
}

/** Most questions in one sitting, so a review stays short. */
const SESSION_SIZE = 8;

/** The questions that are due, taken from the course chapters and answered with the same quiz widget. */
@Component({
  selector: 'app-review',
  imports: [RouterLink, CourseSectionComponent, TPipe],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewComponent implements OnInit {
  private http = inject(HttpClient);
  private courses = inject(CourseService);
  private markdown = inject(MarkdownService);
  readonly review = inject(QuizReviewService);

  readonly loading = signal(true);
  readonly items = signal<ReviewItem[]>([]);
  readonly total = signal(0);

  async ngOnInit(): Promise<void> {
    await Promise.all([this.review.ready, this.courses.ready]);
    // A snapshot: answering a question must not make it vanish from the page
    const due = this.review.due();
    this.total.set(due.length);
    const chapters = new Map<string, string | null>();
    const items: ReviewItem[] = [];
    for (const q of due.slice(0, SESSION_SIZE)) {
      const course = this.courses.getCourseById(q.courseId);
      const file = `${q.chapterId}.md`;
      if (!course?.chapters?.includes(file)) continue; // the course changed: skip a stale question
      const path = this.courses.chapterPath(course, file);
      if (!chapters.has(path)) {
        chapters.set(path, await firstValueFrom(this.http.get(path, { responseType: 'text' })).catch(() => null));
      }
      const md = chapters.get(path);
      const source = md ? this.markdown.extractQuizzes(md)[q.index] : undefined;
      if (source === undefined) continue;
      const title = this.markdown.getHeadings(md!).find(h => h.level === 1)?.text ?? q.chapterId;
      const key = `${q.courseId}:${q.chapterId}:${q.index}`;
      items.push({
        key, courseId: q.courseId, courseTitle: course.title, chapterId: q.chapterId, chapterTitle: title, index: q.index,
        section: { id: `review-${items.length}`, title, content: '```quiz\n' + source + '\n```' },
      });
    }
    this.items.set(items);
    this.loading.set(false);
  }
}
