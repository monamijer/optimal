import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { I18nService } from '../../../core/i18n/i18n.service';
import { CourseService } from './course.service';

describe('CourseService', () => {
  let service: CourseService;
  let http: HttpTestingController;

  const catalog = {
    courses: [
      { id: 'a', title: 'A', description: 'd', accessLevel: 'free', chapters: ['one.md', 'two.md'] },
      { id: 'b', title: 'B', description: 'd', accessLevel: 'premium', chapters: ['x.md'] },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(CourseService);
  });

  it('loads the catalogue once and exposes it', async () => {
    expect(service.courses()).toEqual([]);
    http.expectOne('courses/catalog.json').flush(catalog);
    await service.ready;
    expect(service.courses().length).toBe(2);
    expect(service.getCourseById('b')?.title).toBe('B');
    expect(service.getCourseById('nope')).toBeUndefined();
  });

  it('loads chapters concurrently and preserves their catalogue order', async () => {
    http.expectOne('courses/catalog.json').flush(catalog);
    const pending = service.loadCourse('a');
    await service.ready;

    // Both requests should be in flight before either response is returned.
    const first = http.expectOne('courses/a/one.md');
    const second = http.expectOne('courses/a/two.md');

    // Resolve the second request first to prove output order is deterministic.
    second.flush('# Two');
    first.flush('# One');

    const sections = await pending;
    expect(sections.map(section => section.id)).toEqual(['one', 'two']);
    expect(sections.map(section => section.title)).toEqual(['One', 'Two']);
  });

  it('continues loading when an individual chapter is unavailable', async () => {
    http.expectOne('courses/catalog.json').flush(catalog);
    const pending = service.loadCourse('a');
    await service.ready;

    const first = http.expectOne('courses/a/one.md');
    const second = http.expectOne('courses/a/two.md');
    first.flush('missing', { status: 404, statusText: 'Not Found' });
    second.flush('# Two');

    const sections = await pending;
    expect(sections.map(section => section.id)).toEqual(['two']);
  });

  it('returns an empty list for an unknown course', async () => {
    http.expectOne('courses/catalog.json').flush(catalog);
    await service.ready;

    expect(await service.loadCourse('unknown')).toEqual([]);
  });

  it('flags a failed catalogue and still resolves ready', async () => {
    http.expectOne('courses/catalog.json').flush('boom', { status: 500, statusText: 'Server Error' });
    await service.ready;
    expect(service.loadFailed()).toBeTrue();
    expect(service.courses()).toEqual([]);
  });

  it('serves translated texts and chapter files, with English fallback', async () => {
    http.expectOne('courses/catalog.json').flush({
      courses: [{
        id: 'a', title: 'Algorithms', description: 'en', accessLevel: 'free', chapters: ['one.md', 'two.md'],
        i18n: { fr: { title: 'Algorithmes' } }, langs: { fr: ['one.md'] },
      }],
    });
    await service.ready;
    const i18n = TestBed.inject(I18nService);
    const course = () => service.getCourseById('a')!;

    i18n.setLang('fr');
    expect(course().title).toBe('Algorithmes');
    expect(course().description).toBe('en');
    expect(service.chapterPath(course(), 'one.md')).toBe('courses/a/one.fr.md');
    expect(service.chapterPath(course(), 'two.md')).toBe('courses/a/two.md');

    i18n.setLang('en');
    expect(course().title).toBe('Algorithms');
    expect(service.chapterPath(course(), 'one.md')).toBe('courses/a/one.md');
  });
});
