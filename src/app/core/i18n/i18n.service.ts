import { Injectable, computed, signal } from '@angular/core';
import { FR } from './fr';
import { EN } from './en';

export type Lang = 'fr' | 'en';
export type Dict = Record<string, string>;

/** Add a language: create `<code>.ts`, register it here. Missing keys fall back to French. */
export const LANGUAGES: { code: Lang; label: string; locale: string }[] = [
  { code: 'fr', label: 'Français', locale: 'fr-FR' },
  { code: 'en', label: 'English', locale: 'en-US' },
];

const DICTS: Record<Lang, Dict> = { fr: FR, en: EN };
const STORAGE_KEY = 'optimal_lang';

function isLang(v: unknown): v is Lang {
  return LANGUAGES.some(l => l.code === v);
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(this.initial());
  readonly locale = computed(() => LANGUAGES.find(l => l.code === this.lang())!.locale);
  readonly languages = LANGUAGES;

  constructor() {
    this.applyToDocument(this.lang());
  }

  /** The language the toggle button switches to (cycles through all languages). */
  nextLang(): Lang {
    const i = LANGUAGES.findIndex(l => l.code === this.lang());
    return LANGUAGES[(i + 1) % LANGUAGES.length].code;
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* storage unavailable */ }
    this.applyToDocument(lang);
  }

  /** Translate a key; `{name}` placeholders are replaced from `params`. Reads a signal, so templates stay reactive. */
  t(key: string, params?: Record<string, string | number>): string {
    const d = DICTS[this.lang()];
    // Plurals: pass `count`; `<key>.one` is used when count is 1 and exists.
    const k = params?.['count'] === 1 && (key + '.one') in d ? key + '.one' : key;
    const raw = d[k] ?? FR[k] ?? FR[key] ?? key;
    return params ? raw.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`)) : raw;
  }

  /** Number formatted for the active locale, with non-breaking spaces. */
  num(n: number): string {
    return new Intl.NumberFormat(this.locale()).format(n).replace(/[  ]/g, ' ');
  }

  private initial(): Lang {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLang(saved)) return saved;
    } catch { /* ignore */ }
    const browser = typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] : '';
    return isLang(browser) ? browser : 'fr';
  }

  private applyToDocument(lang: Lang): void {
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }
}
