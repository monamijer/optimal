import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  const create = () => {
    TestBed.resetTestingModule();
    return TestBed.inject(ProgressService);
  };

  beforeEach(() => localStorage.clear());

  it('starts empty', () => {
    const service = create();
    expect(service.last()).toBeNull();
    expect(service.get('algorithms')).toBeUndefined();
  });

  it('keeps the best percentage reached', () => {
    const service = create();
    service.record('algorithms', 60);
    service.record('algorithms', 20);
    expect(service.get('algorithms')?.percent).toBe(60);
  });

  it('clamps out-of-range values', () => {
    const service = create();
    service.record('a', 250);
    service.record('b', -5);
    expect(service.get('a')?.percent).toBe(100);
    expect(service.get('b')?.percent).toBe(0);
  });

  it('returns the most recently visited course', () => {
    const service = create();
    service.record('a', 10);
    service.record('b', 5);
    expect(service.last()?.courseId).toBe('b');
  });

  it('persists to localStorage and survives a reload', () => {
    create().record('reseaux', 42);
    expect(create().get('reseaux')?.percent).toBe(42);
  });

  it('ignores corrupted storage', () => {
    localStorage.setItem('optimal.progress', '{not json');
    expect(create().last()).toBeNull();
  });
});
