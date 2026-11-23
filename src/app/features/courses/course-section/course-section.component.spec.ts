import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseSectionComponent } from './course-section.component';

describe('CourseSectionComponent', () => {
  let component: CourseSectionComponent;
  let fixture: ComponentFixture<CourseSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
      imports: [CourseSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('section', { id: 'intro', title: 'Intro', content: '# Intro\n\nTexte.' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('quiz', () => {
    const quiz = '```quiz\nQuestion ?\n- [ ] faux\n- [x] vrai\n> Parce que.\n```';
    let root: HTMLElement;
    beforeEach(() => {
      fixture.componentRef.setInput('section', { id: 'q', title: 'Q', content: quiz });
      fixture.detectChanges();
      root = fixture.nativeElement;
    });
    const radios = () => Array.from(root.querySelectorAll<HTMLInputElement>('input[type=radio]'));
    const click = (sel: string) => { root.querySelector<HTMLElement>(sel)!.click(); fixture.detectChanges(); };

    it('asks to choose before checking', () => {
      click('.quiz-check');
      expect(root.querySelector('.quiz-feedback')?.textContent).toContain('Choisissez');
    });

    it('marks a right answer, shows the explanation, then can be retried', () => {
      radios()[1].checked = true;
      click('.quiz-check');
      expect(root.querySelector('.quiz-feedback')?.textContent).toContain('Correct. Parce que.');
      expect(radios().every(r => r.disabled)).toBeTrue();
      click('.quiz-retry');
      expect(radios().every(r => !r.disabled && !r.checked)).toBeTrue();
      expect(root.querySelector('.quiz-feedback')?.textContent).toBe('');
    });

    it('marks a wrong answer in text, not only colour', () => {
      radios()[0].checked = true;
      click('.quiz-check');
      expect(root.querySelector('.quiz-feedback')?.textContent).toContain('Pas tout à fait');
      expect(root.textContent).toContain('✗ incorrect');
      expect(root.textContent).toContain('✓ bonne réponse');
    });
  });
});
