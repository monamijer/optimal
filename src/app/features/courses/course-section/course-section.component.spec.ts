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
});
