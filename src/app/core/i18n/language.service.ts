import { Injectable, signal, computed } from '@angular/core';
import { translations, TranslationKey } from './translations';

export type Language = 'es' | 'en';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private language = signal<Language>(this.getSavedLanguage());

  t = computed(() => translations[this.language()]);

  getLanguage(): Language {
    return this.language();
  }

  setLanguage(lang: Language) {
    this.language.set(lang);
    localStorage.setItem('app-language', lang);
  }

  private getSavedLanguage(): Language {
    const saved = localStorage.getItem('app-language') as Language | null;
    if (saved && ['es', 'en'].includes(saved)) {
      return saved;
    }
    const browserLang = navigator.language.split('-')[0];
    if (browserLang && ['es', 'en'].includes(browserLang)) {
      return browserLang as Language;
    }
    return 'es';
  }
}