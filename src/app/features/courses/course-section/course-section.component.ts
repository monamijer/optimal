import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CourseSection } from '../models/courseSection.model';
import { MarkdownService } from '../../../core/services/markdown.service';
import { QuizReviewService } from '../../../core/services/quiz-review.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-course-section',
  imports: [],
  templateUrl: './course-section.component.html',
  styleUrl: './course-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseSectionComponent {
  private markdown = inject(MarkdownService);
  private i18n = inject(I18nService);
  private sanitizer = inject(DomSanitizer);
  private review = inject(QuizReviewService);

  section = input.required<CourseSection>();
  /** When set, quiz results are recorded for spaced review. */
  courseId = input<string>();
  /** Chapter the quizzes belong to, when it differs from the section id (review page). */
  chapterId = input<string>();
  /** Position of the first quiz of this section's content in its chapter. */
  quizBase = input(0);

  /** Quiz buttons live inside the (sanitised) chapter HTML, so they are handled here by delegation. */
  onClick(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.quiz-check, .quiz-retry');
    const form = button?.closest<HTMLFormElement>('form.quiz');
    if (!button || !form) return;
    if (button.classList.contains('quiz-retry')) this.resetQuiz(form);
    else this.checkQuiz(form, button);
  }

  private checkQuiz(form: HTMLFormElement, button: HTMLButtonElement): void {
    const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));
    const feedback = form.querySelector<HTMLElement>('.quiz-feedback')!;
    if (!inputs.some(i => i.checked)) {
      feedback.textContent = this.i18n.t('quiz.pick');
      return;
    }
    let allRight = true;
    for (const input of inputs) {
      const shouldBe = input.hasAttribute('data-correct');
      const label = input.closest('label')!;
      label.querySelector('.quiz-mark')?.remove();
      if (input.checked !== shouldBe) allRight = false;
      label.classList.toggle('is-correct', shouldBe);
      label.classList.toggle('is-wrong', input.checked && !shouldBe);
      if (shouldBe || input.checked) {
        const mark = document.createElement('span');
        mark.className = 'quiz-mark';
        mark.textContent = this.i18n.t(shouldBe ? 'quiz.right' : 'quiz.wrong');
        label.appendChild(mark);
      }
      input.disabled = true;
    }
    const courseId = this.courseId();
    if (courseId) this.review.record(courseId, this.chapterId() ?? this.section().id, Number(form.dataset['qi'] ?? 0), allRight);
    const explanation = form.querySelector('.quiz-explain')?.textContent ?? '';
    feedback.textContent = `${this.i18n.t(allRight ? 'quiz.correct' : 'quiz.almost')} ${explanation}`.trim();
    feedback.classList.toggle('ok', allRight);
    button.textContent = this.i18n.t('quiz.retry');
    button.classList.replace('quiz-check', 'quiz-retry');
  }

  private resetQuiz(form: HTMLFormElement): void {
    form.querySelectorAll<HTMLInputElement>('input').forEach(i => { i.checked = false; i.disabled = false; });
    form.querySelectorAll('.quiz-mark').forEach(m => m.remove());
    form.querySelectorAll('label').forEach(l => l.classList.remove('is-correct', 'is-wrong'));
    const feedback = form.querySelector<HTMLElement>('.quiz-feedback')!;
    feedback.textContent = '';
    feedback.classList.remove('ok');
    const button = form.querySelector<HTMLButtonElement>('.quiz-retry')!;
    button.textContent = this.i18n.t('quiz.check');
    button.classList.replace('quiz-retry', 'quiz-check');
    form.querySelector<HTMLInputElement>('input')?.focus();
  }

  html = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      this.markdown.parse(this.section().content, this.quizBase())
    )
  );
}
