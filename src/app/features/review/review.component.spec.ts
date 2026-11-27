import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LEARNING_STORE } from '../../core/storage/learning-store';
import { MemoryLearningStore } from '../../core/storage/memory-learning-store';
import { QuizReviewService } from '../../core/services/quiz-review.service';
import { ReviewComponent } from './review.component';

const CHAPTER = '# Sorting\n\n```quiz\nFirst?\n- [x] yes\n- [ ] no\n```\n\ntext\n\n```quiz\nSecond?\n- [ ] no\n- [x] yes\n```\n';

describe('ReviewComponent', () => {
  async function open(missed: number[]) {
    await TestBed.configureTestingModule({
      imports: [ReviewComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: LEARNING_STORE, useValue: new MemoryLearningStore() }],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    const review = TestBed.inject(QuizReviewService);
    const fixture = TestBed.createComponent(ReviewComponent);
    await review.ready;
    for (const i of missed) review.record('algorithms', 'sorting', i, false);
    fixture.detectChanges();
    http.expectOne('courses/catalog.json').flush({ courses: [{ id: 'algorithms', title: 'Algo', description: 'd', accessLevel: 'free', chapters: ['sorting.md'] }] });
    await new Promise(r => setTimeout(r));
    if (missed.length) http.expectOne('courses/algorithms/sorting.md').flush(CHAPTER);
    await new Promise(r => setTimeout(r, 20));
    fixture.detectChanges();
    return { fixture, review, el: fixture.nativeElement as HTMLElement };
  }

  it('shows an empty state when nothing is due', async () => {
    const { el } = await open([]);
    expect(el.querySelector('.rv-empty')?.textContent).toContain('Rien à revoir');
  });

  it('renders the missed question from its chapter and records the new answer', async () => {
    const { fixture, review, el } = await open([1]);
    expect(el.querySelectorAll('form.quiz').length).toBe(1);
    expect(el.querySelector('legend')?.textContent).toContain('Second?');
    // answer correctly: the second option is the right one
    (el.querySelectorAll<HTMLInputElement>('input')[1]).click();
    (el.querySelector('.quiz-check') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(review.all()['algorithms:sorting:1'].last).toBe('right');
    expect(review.all()['algorithms:sorting:1'].box).toBe(1);
  });
});
