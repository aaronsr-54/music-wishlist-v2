import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileSectionComponent } from '../../../shared/components/profile-section/profile-section.component';
import { ThemeService } from '../../../core/theme/theme.service';

type TabType = 'releases' | 'search' | 'wishlist';
type Theme = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, ProfileSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-profile-section title="Configuración">
      <section
        class="border border-solid border-bone-800 dark:border-ink-200 rounded-lg p-4 flex flex-col gap-8 shadow-[0_2px_12px_4px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_4px_rgba(0,0,0,0.15)]"
      >
        <div class="flex flex-col md:flex-row gap-2 md:gap-10 md:items-center">
          <span
            class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] text-ink-700 dark:text-bone-700 italic md:min-w-36"
          >
            Página principal:
          </span>

          <div
            class="p-1 bg-bone-200 dark:bg-ink-200 rounded-2xl md:rounded-pill md:flex-1"
          >
            <div class="flex flex-col md:flex-row gap-1 overflow-hidden">
              <button
                class="flex-1 py-1 font-body uppercase text-ink-600 dark:text-bone-600 rounded-lg [&.active]:bg-bone [&.active]:text-ink [&.active]:font-bold"
                [class.active]="defaultTab() === 'releases'"
                (click)="setDefaultTab('releases')"
              >
                Lanzamientos
              </button>

              <button
                class="flex-1 py-1 font-body uppercase text-ink-600 dark:text-bone-600 rounded-lg [&.active]:bg-bone [&.active]:text-ink [&.active]:font-bold"
                [class.active]="defaultTab() === 'search'"
                (click)="setDefaultTab('search')"
              >
                Buscador
              </button>

              <button
                class="flex-1 py-1 font-body uppercase text-ink-600 dark:text-bone-600 rounded-lg [&.active]:bg-bone [&.active]:text-ink [&.active]:font-bold"
                [class.active]="defaultTab() === 'wishlist'"
                (click)="setDefaultTab('wishlist')"
              >
                Wishlist
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-2 md:gap-10 md:items-center">
          <span
            class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] text-ink-700 dark:text-bone-700 italic md:min-w-36"
          >
            Tema:
          </span>

          <div
            class="p-1 bg-bone-200 dark:bg-ink-200 rounded-2xl md:rounded-pill md:flex-1"
          >
            <div class="flex flex-col md:flex-row gap-1 overflow-hidden">
              <button
                class="flex-1 py-1 font-body uppercase text-ink-600 dark:text-bone-600 rounded-lg [&.active]:bg-bone [&.active]:text-ink [&.active]:font-bold"
                [class.active]="currentTheme() === 'system'"
                (click)="setTheme('system')"
              >
                Sistema
              </button>

              <button
                class="flex-1 py-1 font-body uppercase text-ink-600 dark:text-bone-600 rounded-lg [&.active]:bg-bone [&.active]:text-ink [&.active]:font-bold"
                [class.active]="currentTheme() === 'light'"
                (click)="setTheme('light')"
              >
                Claro
              </button>

              <button
                class="flex-1 py-1 font-body uppercase text-ink-600 dark:text-bone-600 rounded-lg [&.active]:bg-bone [&.active]:text-ink [&.active]:font-bold"
                [class.active]="currentTheme() === 'dark'"
                (click)="setTheme('dark')"
              >
                Oscuro
              </button>
            </div>
          </div>
        </div>
      </section>
    </app-profile-section>
  `,
})
export class ProfileSettingsComponent {
  defaultTab = signal<TabType>('releases');
  currentTheme = signal<Theme>('system');

  constructor(private themeService: ThemeService) {
    const saved = localStorage.getItem('defaultTab') as TabType | null;

    if (saved) {
      this.defaultTab.set(saved);
    }

    this.currentTheme.set(this.themeService.getTheme());
  }

  setDefaultTab(tab: TabType) {
    this.defaultTab.set(tab);
    localStorage.setItem('defaultTab', tab);
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
    this.themeService.setTheme(theme);
  }
}
