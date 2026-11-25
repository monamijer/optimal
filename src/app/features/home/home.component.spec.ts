import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LEARNING_STORE } from '../../core/storage/learning-store';
import { MemoryLearningStore } from '../../core/storage/memory-learning-store';
import { I18nService } from '../../core/i18n/i18n.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    localStorage.setItem('optimal_lang', 'fr');
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

  it('has one h1 and links to the chapter that explains the demo', () => {
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('a.go')?.getAttribute('href')).toBe('/courses/algorithms#binary-search');
  });

  it('shows real catalogue numbers and a row per course', () => {
    expect(el.querySelector('.library .count')?.textContent).toContain('1 cours, 2 chapitres');
    expect(el.querySelectorAll('app-course-card').length).toBe(1);
  });

  it('moving the slider updates the numbers and announces them', () => {
    const input = el.querySelector<HTMLInputElement>('input[type=range]')!;
    input.value = '9';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(el.querySelector('.size')?.textContent).toContain('1 000 000 000');
    expect(el.querySelector('[role=status]')?.textContent).toContain('30 pas');
  });

  it('switches to English without reloading', () => {
    TestBed.inject(I18nService).setLang('en');
    fixture.detectChanges();
    expect(el.querySelector('h1')?.textContent).toContain('How many steps');
    expect(el.querySelector('.library .count')?.textContent).toContain('1 course, 2 chapters');
    TestBed.inject(I18nService).setLang('fr');
  });
});
