import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LEARNING_STORE } from '../../core/storage/learning-store';
import { MemoryLearningStore } from '../../core/storage/memory-learning-store';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: LEARNING_STORE, useValue: new MemoryLearningStore() }],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HomeComponent);
    http.expectOne('courses/catalog.json').flush({
      courses: [{ id: 'algorithms', title: 'Algo', description: 'd', icon: 'bi-code', accessLevel: 'free', chapters: ['a.md', 'b.md'] }],
    });
    await fixture.whenStable();
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('has one h1 and a start button for the first free course', () => {
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('.btn-main')?.getAttribute('href')).toBe('/courses/algorithms');
  });

  it('shows real catalogue numbers', () => {
    expect(el.querySelector('.facts')?.textContent).toContain('1 cours · 2 chapitres');
  });

  it('lets the visitor highlight a phrase in the demo (toggle, aria-pressed)', () => {
    const idea = el.querySelector<HTMLButtonElement>('.idea')!;
    expect(idea.getAttribute('aria-pressed')).toBe('false');
    idea.click();
    fixture.detectChanges();
    expect(idea.getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelector('.demo-status')?.textContent).toContain('1 sur 3');
    idea.click();
    fixture.detectChanges();
    expect(idea.getAttribute('aria-pressed')).toBe('false');
  });
});
