import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CourseSectionService } from './course-section.service';

describe('CourseSectionService', () => {
  let service: CourseSectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CourseSectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
