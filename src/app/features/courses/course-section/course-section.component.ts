import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CourseSection } from '../models/courseSection.model';
import { MarkdownService } from '../../../core/services/markdown.service';
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
  private sanitizer = inject(DomSanitizer);

  section = input.required<CourseSection>();

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
      feedback.textContent = 'Choisissez au moins une réponse.';
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
        mark.textContent = shouldBe ? ' ✓ bonne réponse' : ' ✗ incorrect';
        label.appendChild(mark);
      }
      input.disabled = true;
    }
    const explanation = form.querySelector('.quiz-explain')?.textContent ?? '';
    feedback.textContent = `${allRight ? 'Correct.' : 'Pas tout à fait.'} ${explanation}`.trim();
    feedback.classList.toggle('ok', allRight);
    button.textContent = 'Réessayer';
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
    button.textContent = 'Vérifier';
    button.classList.replace('quiz-retry', 'quiz-check');
    form.querySelector<HTMLInputElement>('input')?.focus();
  }

  html = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      this.markdown.parse(this.section().content)
    )
  );
}
