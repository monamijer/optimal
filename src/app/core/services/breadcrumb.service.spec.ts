import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { CourseService } from '../../features/courses/services/course.service';
import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {
  it('shows the course title instead of its id', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const courses = TestBed.inject(CourseService); // starts the catalogue request
    TestBed.inject(HttpTestingController).expectOne('courses/catalog.json').flush({
      courses: [{ id: 'base_de_donnees', title: 'Bases de données', description: 'd', accessLevel: 'free' }],
    });
    await courses.ready;
    const route = { data: { breadcrumb: 'Cours' }, routeConfig: { path: ':id' }, params: { id: 'base_de_donnees' }, firstChild: null } as unknown as ActivatedRouteSnapshot;
    expect(TestBed.inject(BreadcrumbService).build(route)[0].label).toBe('Bases de données');
  });
});
