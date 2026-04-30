import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


export type Lang = 'fr' | 'en' | 'es';


export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
];

const STORAGE_KEY = 'optimal_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {


  currentLang = signal<Lang>(this.loadSavedLang());


  constructor(private translate: TranslateService) {

    translate.addLangs(['fr', 'en', 'es']);


    translate.setDefaultLang('fr');


    this.applyLang(this.currentLang());
  }


  setLang(lang: Lang): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
   }


  get languages() { return LANGUAGES; }

  private applyLang(lang: Lang): void {
    this.translate.use(lang);
    document.documentElement.lang = lang;
  }

  private loadSavedLang(): Lang {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang;
    if (saved && ['fr', 'en', 'es'].includes(saved)) return saved;

    const browserLang = navigator.language.split('-')[0] as Lang;
    if (['fr', 'en', 'es'].includes(browserLang)) return browserLang;

    return 'fr';
  }
}
