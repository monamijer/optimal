import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LEARNING_STORE } from '../../../../core/storage/learning-store';
import { MemoryLearningStore } from '../../../../core/storage/memory-learning-store';
import { CourseListComponent } from './course-list.component';

describe('CourseListComponent filters', () => {
  let fixture: ComponentFixture<CourseListComponent>;
  let el: HTMLElement;
  const chip = (label: string) => Array.from(el.querySelectorAll<HTMLButtonElement>('.chip')).find(b => b.textContent?.trim() === label)!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: LEARNING_STORE, useValue: new MemoryLearningStore() }],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CourseListComponent);
    http.expectOne('courses/catalog.json').flush({
      courses: [
        { id: 'a', title: 'Libre', description: 'd', accessLevel: 'free', category: 'X', chapters: ['1.md'] },
        { id: 'b', title: 'Payant', description: 'd', accessLevel: 'premium', category: 'Y', chapters: ['1.md'] },
      ],
    });
    await fixture.whenStable();
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('shows every course by default', () => {
    expect(el.querySelectorAll('app-course-card').length).toBe(2);
    expect(chip('Tous').getAttribute('aria-pressed')).toBe('true');
  });

  it('filters free courses', () => {
    chip('Gratuits').click();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-course-card').length).toBe(1);
  });

  it('explains an empty "En cours" list and offers to see everything', () => {
    chip('En cours').click();
    fixture.detectChanges();
    expect(el.querySelectorAll('app-course-card').length).toBe(0);
    expect(el.querySelector('.empty')?.textContent).toContain('pas encore commencé');
  });
});
