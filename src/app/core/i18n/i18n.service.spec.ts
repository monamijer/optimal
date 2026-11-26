import { TestBed } from '@angular/core/testing';
import { FR } from './fr';
import { EN } from './en';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let i18n: I18nService;
  beforeEach(() => {
    localStorage.removeItem('optimal_lang');
    TestBed.configureTestingModule({});
    i18n = TestBed.inject(I18nService);
    i18n.setLang('fr');
  });

  it('every French key exists in English and vice versa', () => {
    const base = (d: Record<string, string>) => Object.keys(d).filter(k => !k.endsWith('.one')).sort();
    expect(base(EN)).toEqual(base(FR));
  });

  it('translates, interpolates and falls back to the key', () => {
    expect(i18n.t('nav.courses')).toBe('Cours');
    i18n.setLang('en');
    expect(i18n.t('nav.courses')).toBe('Courses');
    expect(i18n.t('home.read', { n: 40 })).toBe('40% read');
    expect(i18n.t('no.such.key')).toBe('no.such.key');
  });

  it('formats numbers for the active locale and sets <html lang>', () => {
    expect(i18n.num(1_000_000)).toBe('1 000 000');
    i18n.setLang('en');
    expect(i18n.num(1_000_000)).toBe('1,000,000');
    expect(document.documentElement.lang).toBe('en');
  });

  it('cycles to the next language', () => {
    expect(i18n.nextLang()).toBe('en');
  });
});
