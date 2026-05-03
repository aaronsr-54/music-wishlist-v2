import { Injectable, computed, effect, signal } from '@angular/core';

type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private theme = signal<Theme>(this.getSavedTheme());
  private systemPrefersDark = signal(this.getSystemPreference());

  isDarkMode = computed(() => {
    const theme = this.theme();
    if (theme === 'system') {
      return this.systemPrefersDark();
    }
    return theme === 'dark';
  });

  constructor() {
    this.initSystemThemeListener();
    effect(() => {
      this.isDarkMode();
      this.updateTheme();
    });
  }

  private getSystemPreference(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private initSystemThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      this.systemPrefersDark.set(e.matches);
    });
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);
    localStorage.setItem('app-theme', theme);
  }

  getTheme(): Theme {
    return this.theme();
  }

  toggleTheme() {
    const current = this.theme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  private getSavedTheme(): Theme {
    const saved = localStorage.getItem('app-theme') as Theme | null;
    return saved && ['light', 'dark', 'system'].includes(saved)
      ? saved
      : 'system';
  }

  private updateTheme() {
    const isDark = this.isDarkMode();

    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      html.removeAttribute('data-theme');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    }
  }
}
