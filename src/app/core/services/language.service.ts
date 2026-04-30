import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// ✅ Type strict — seules ces 3 valeurs sont acceptées
export type Lang = 'fr' | 'en' | 'es';

// Métadonnées affichées dans le sélecteur de langue
export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
];

const STORAGE_KEY = 'optimal_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {

  // Signal qui expose la langue active à tous les composants
  currentLang = signal<Lang>(this.loadSavedLang());

  // On reçoit TranslateService par injection de dépendances
  constructor(private translate: TranslateService) {
    // 1. Déclarer les langues disponibles
    translate.addLangs(['fr', 'en', 'es']);

    // 2. Langue de secours si une clé est manquante
    translate.setDefaultLang('fr');

    // 3. Appliquer la langue sauvegardée (ou français par défaut)
    this.applyLang(this.currentLang());
  }

  /**
   * Change la langue active, met à jour le signal et sauvegarde dans localStorage.
   * Tous les composants qui utilisent le signal ou le pipe | translate
   * se mettent à jour automatiquement.
   */
  setLang(lang: Lang): void {
    this.translate.use(lang);           // charge le fichier JSON de la langue
    this.currentLang.set(lang);         // met à jour le signal → réactivité Angular
    localStorage.setItem(STORAGE_KEY, lang); // persiste le choix
    document.documentElement.lang = lang;    // accessibilité : attribut <html lang="">
  }

  // Utilisé dans le template pour les métadonnées (label, flag)
  get languages() { return LANGUAGES; }

  private applyLang(lang: Lang): void {
    this.translate.use(lang);
    document.documentElement.lang = lang;
  }

  private loadSavedLang(): Lang {
    // Ordre de priorité :
    // 1. Langue sauvegardée par l'utilisateur
    // 2. Langue du navigateur si supportée
    // 3. Français par défaut
    const saved = localStorage.getItem(STORAGE_KEY) as Lang;
    if (saved && ['fr', 'en', 'es'].includes(saved)) return saved;

    const browserLang = navigator.language.split('-')[0] as Lang;
    if (['fr', 'en', 'es'].includes(browserLang)) return browserLang;

    return 'fr';
  }
}
