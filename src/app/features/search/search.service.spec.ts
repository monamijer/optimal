import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { SearchService, normalize } from './search.service';

describe('SearchService', () => {
  const loggedIn = signal(false);
  let service: SearchService;

  const catalog = {
    courses: [
      { id: 'free', title: 'Cours libre', description: 'd', accessLevel: 'free', chapters: ['a.md'] },
      { id: 'vip', title: 'Cours payant', description: 'd', accessLevel: 'premium', chapters: ['b.md'] },
    ],
  };

  beforeEach(async () => {
    loggedIn.set(false);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: AuthService, useValue: { isLoggedIn: () => loggedIn() } }],
    });
    const http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(SearchService);
    const built = service.ensureIndex();
    http.expectOne('courses/catalog.json').flush(catalog);
    await new Promise(r => setTimeout(r));
    http.expectOne('courses/free/a.md').flush('# Tableaux\n\nUn tableau stocke des éléments contigus.\n\n## Complexité\n\nL\'accès est en temps constant.');
    http.expectOne('courses/vip/b.md').flush('# Secret\n\nLe contenu réservé parle de cryptographie.');
    await built;
  });

  it('normalises accents and case', () => {
    expect(normalize('Éléments Contigus')).toBe('elements contigus');
  });

  it('finds a passage without needing accents and links to its heading', () => {
    const [first] = service.search('elements');
    expect(first.courseId).toBe('free');
    expect(first.heading).toBe('Tableaux');
    expect(first.snippet.some(p => p.hit)).toBeTrue();
  });

  it('requires every word, and ignores one-letter queries', () => {
    expect(service.search('tableau constant').length).toBe(0);
    expect(service.search('acces constant')[0].heading).toBe('Complexité');
    expect(service.search('a')).toEqual([]);
  });

  it('ranks heading matches above body matches', () => {
    expect(service.search('tableaux')[0].heading).toBe('Tableaux');
  });

  it('hides premium passages from visitors who are not signed in', () => {
    const hidden = service.search('cryptographie')[0];
    expect(hidden.locked).toBeTrue();
    expect(hidden.snippet).toEqual([]);
    loggedIn.set(true);
    expect(service.search('cryptographie')[0].snippet.length).toBeGreaterThan(0);
  });
});
