import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input } from '@angular/core';
import { CourseSection } from '../models/courseSection.model';
import { MarkdownService } from '../../../core/services/markdown.service';
import type { ParsedExercise } from '../../../core/services/exercise-markdown';
import { ExerciseProgressService } from '../../../core/services/exercise-progress.service';
import { SqlRunnerService } from '../../../core/services/sql-runner.service';
import { SqlTable, compareResults, isOrdered } from '../../../core/services/sql-compare';
import { isAcceptedAnswer } from '../../../core/services/exercise-markdown';
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
  private exProgress = inject(ExerciseProgressService);
  private runner = inject(SqlRunnerService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Mark the exercises already solved (also after the chapter is rendered again, e.g. after a language change)
    effect(() => {
      this.html();
      this.exProgress.all();
      setTimeout(() => this.markSolved());
    });
  }

  private markSolved(): void {
    const courseId = this.courseId();
    if (!courseId) return;
    const chapterId = this.chapterId() ?? this.section().id;
    this.host.nativeElement.querySelectorAll<HTMLFormElement>('form.exercise').forEach(form => {
      form.classList.toggle('is-solved', this.exProgress.isSolved(courseId, chapterId, Number(form.dataset['ei'] ?? 0)));
    });
  }

  section = input.required<CourseSection>();
  /** When set, quiz results are recorded for spaced review. */
  courseId = input<string>();
  /** Chapter the quizzes belong to, when it differs from the section id (review page). */
  chapterId = input<string>();
  /** Position of the first quiz of this section's content in its chapter. */
  quizBase = input(0);

  /** Quiz buttons live inside the (sanitised) chapter HTML, so they are handled here by delegation. */
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const exButton = target.closest<HTMLButtonElement>('.ex-check, .ex-run, .ex-hint-btn, .ex-reset, .ex-solution-btn');
    const exForm = exButton?.closest<HTMLFormElement>('form.exercise');
    if (exButton && exForm) {
      void this.onExercise(exButton, exForm);
      return;
    }
    const button = target.closest<HTMLButtonElement>('.quiz-check, .quiz-retry');
    const form = button?.closest<HTMLFormElement>('form.quiz');
    if (!button || !form) return;
    if (button.classList.contains('quiz-retry')) this.resetQuiz(form);
    else this.checkQuiz(form, button);
  }

  /** Code exercises: the SQL runs in a worker; the page only shows the verdict and the result table. */
  private async onExercise(button: HTMLButtonElement, form: HTMLFormElement): Promise<void> {
    const index = Number(form.dataset['ei'] ?? 0);
    const ex = this.markdown.extractExercises(this.section().content)[index];
    const out = form.querySelector<HTMLElement>('.ex-out')!;
    const input = form.querySelector<HTMLTextAreaElement | HTMLInputElement>('.ex-input')!;
    if (!ex) return;
    if (ex.kind === 'answer') {
      this.onAnswer(button, form, ex, input, index);
      return;
    }

    if (button.classList.contains('ex-reset')) {
      input.value = ex.starter;
      out.replaceChildren();
      return;
    }
    if (button.classList.contains('ex-hint-btn')) {
      this.showText(out, 'ex-note', ex.hint ?? '');
      return;
    }
    if (button.classList.contains('ex-solution-btn')) {
      input.value = ex.solution;
      out.replaceChildren();
      this.showText(out, 'ex-note', this.i18n.t('ex.solutionShown'));
      return;
    }

    const check = button.classList.contains('ex-check');
    const sql = input.value.trim();
    if (!sql) { this.showText(out, 'ex-bad', this.i18n.t('ex.empty')); return; }
    this.showText(out, 'ex-note', this.i18n.t('ex.running'));
    form.querySelectorAll('button').forEach(b => (b.disabled = true));
    try {
      const setup = await this.runner.expandSetup(this.courseId() ?? '', ex.setup);
      const res = await this.runner.run({ setup, learner: sql, solution: check ? ex.solution : undefined, check: ex.check });
      out.replaceChildren();
      if (res.learner.error) {
        this.showText(out, 'ex-bad', this.i18n.t('ex.error', { msg: res.learner.error }));
        if (check) this.recordExercise(form, index, false);
        return;
      }
      const table = res.learner.table ?? null;
      if (check) {
        const verdict = compareResults(res.solution?.table ?? null, table, isOrdered(ex.check ?? ex.solution));
        this.recordExercise(form, index, verdict.ok);
        if (verdict.ok) {
          this.showText(out, 'ex-good', this.i18n.t('ex.right'));
        } else {
          const expected = res.solution?.table;
          this.showText(out, 'ex-bad', this.i18n.t('ex.wrong.' + verdict.reason, { n: expected?.total ?? 0, got: table?.total ?? 0 }));
          if (!form.querySelector('.ex-solution-btn')) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'ex-solution-btn';
            b.textContent = this.i18n.t('ex.solution');
            form.querySelector('.ex-actions')!.appendChild(b);
          }
        }
      }
      if (table) out.appendChild(this.tableEl(table));
      else if (!check) this.showText(out, 'ex-note', this.i18n.t('ex.noRows'));
    } catch (e) {
      out.replaceChildren();
      const key = (e as Error).message === 'timeout' ? 'ex.timeout' : 'ex.unavailable';
      this.showText(out, 'ex-bad', this.i18n.t(key));
    } finally {
      form.querySelectorAll('button').forEach(b => (b.disabled = false));
    }
  }

  /** Short-answer exercises: nothing runs, the typed text is compared with the accepted answers. */
  private onAnswer(button: HTMLButtonElement, form: HTMLFormElement, ex: ParsedExercise, input: HTMLInputElement | HTMLTextAreaElement, index: number): void {
    const out = form.querySelector<HTMLElement>('.ex-out')!;
    out.replaceChildren();
    if (button.classList.contains('ex-reset')) { input.value = ''; return; }
    if (button.classList.contains('ex-hint-btn')) { this.showText(out, 'ex-note', ex.hint ?? ''); return; }
    if (button.classList.contains('ex-solution-btn')) {
      input.value = ex.answers?.[0] ?? '';
      this.showText(out, 'ex-note', `${this.i18n.t('ex.solutionShown')} ${ex.explain ?? ''}`.trim());
      return;
    }
    if (!input.value.trim()) { this.showText(out, 'ex-bad', this.i18n.t('ex.ans.empty')); return; }
    const ok = isAcceptedAnswer(input.value, ex.answers ?? []);
    this.recordExercise(form, index, ok);
    if (ok) {
      this.showText(out, 'ex-good', `${this.i18n.t('ex.ans.right')} ${ex.explain ?? ''}`.trim());
    } else {
      this.showText(out, 'ex-bad', this.i18n.t('ex.ans.wrong'));
      if (!form.querySelector('.ex-solution-btn')) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ex-solution-btn';
        b.textContent = this.i18n.t('ex.solution');
        form.querySelector('.ex-actions')!.appendChild(b);
      }
    }
  }

  private recordExercise(form: HTMLFormElement, index: number, ok: boolean): void {
    const courseId = this.courseId();
    if (courseId) this.exProgress.record(courseId, this.chapterId() ?? this.section().id, index, ok);
    if (ok) form.classList.add('is-solved');
  }

  private showText(out: HTMLElement, cls: string, text: string): void {
    const p = document.createElement('p');
    p.className = cls;
    p.textContent = text;
    out.appendChild(p);
  }

  /** The learner's result as a small table (built with textContent only, never innerHTML). */
  private tableEl(t: SqlTable): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'ex-table-wrap';
    wrap.tabIndex = 0;
    const table = document.createElement('table');
    table.className = 'ex-table';
    const head = table.createTHead().insertRow();
    for (const c of t.columns) { const th = document.createElement('th'); th.scope = 'col'; th.textContent = c; head.appendChild(th); }
    const body = table.createTBody();
    for (const row of t.rows.slice(0, 20)) {
      const tr = body.insertRow();
      for (const v of row) {
        const td = tr.insertCell();
        if (v === null) { td.textContent = 'NULL'; td.className = 'ex-null'; } else td.textContent = String(v);
      }
    }
    wrap.appendChild(table);
    const caption = document.createElement('p');
    caption.className = 'ex-count';
    caption.textContent = this.i18n.t('ex.rows', { n: t.total });
    wrap.appendChild(caption);
    return wrap;
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
