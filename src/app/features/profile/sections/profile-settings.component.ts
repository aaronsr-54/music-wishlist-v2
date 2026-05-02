import {
  Component,
  signal,
  ChangeDetectionStrategy,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileSectionComponent } from '../../../shared/components/profile-section/profile-section.component';
import { SegmentedTabsComponent } from '../../../shared/components/segmented-tabs/segmented-tabs.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ModalOptionsComponent } from '../../../shared/components/modal-options/modal-options.component';
import { ThemeService } from '../../../core/theme/theme.service';

type TabType = 'releases' | 'search' | 'wishlist';
type Theme = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    CommonModule,
    ProfileSectionComponent,
    SegmentedTabsComponent,
    ModalComponent,
    ModalOptionsComponent,
  ],
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

          <button
            class="md:hidden w-full text-left px-4 py-2 rounded-lg bg-bone dark:bg-ink-700 text-ink dark:text-bone font-bold uppercase font-display text-center"
            (click)="showTabModal.set(true)"
          >
            {{ tabOptionLabel() }}
          </button>

          <app-segmented-tabs
            class="hidden md:flex flex-1"
            [options]="tabOptions()"
            [value]="defaultTab()"
            variant="toggle"
            (valueChange)="onTabChange($event)"
          />
        </div>

        <div class="flex flex-col md:flex-row gap-2 md:gap-10 md:items-center">
          <span
            class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] text-ink-700 dark:text-bone-700 italic md:min-w-36"
          >
            Tema:
          </span>

          <button
            class="md:hidden w-full text-left px-4 py-2 rounded-lg bg-bone dark:bg-ink-700 text-ink dark:text-bone font-bold uppercase font-display text-center"
            (click)="showThemeModal.set(true)"
          >
            {{ themeOptionLabel() }}
          </button>

          <app-segmented-tabs
            class="hidden md:flex flex-1"
            [options]="themeOptions()"
            [value]="currentTheme()"
            variant="toggle"
            (valueChange)="onThemeChange($event)"
          />
        </div>
      </section>

      @if (showTabModal()) {
        <app-modal title="Página principal" (onClose)="showTabModal.set(false)">
          <app-modal-options
            [options]="tabOptions()"
            [value]="defaultTab()"
            (valueChange)="onTabChange($event); showTabModal.set(false)"
          />
        </app-modal>
      }

      @if (showThemeModal()) {
        <app-modal title="Tema" (onClose)="showThemeModal.set(false)">
          <app-modal-options
            [options]="themeOptions()"
            [value]="currentTheme()"
            (valueChange)="onThemeChange($event); showThemeModal.set(false)"
          />
        </app-modal>
      }
    </app-profile-section>
  `,
})
export class ProfileSettingsComponent {
  private themeService = inject(ThemeService);

  defaultTab = signal<TabType>('releases');
  currentTheme = signal<Theme>('system');

  tabOptions = signal([
    { value: 'releases' as const, label: 'Lanzamientos' },
    { value: 'search' as const, label: 'Buscador' },
    { value: 'wishlist' as const, label: 'Wishlist' },
  ]);

  themeOptions = signal([
    { value: 'system' as const, label: 'Sistema' },
    { value: 'light' as const, label: 'Claro' },
    { value: 'dark' as const, label: 'Oscuro' },
  ]);

  showTabModal = signal(false);
  showThemeModal = signal(false);

  tabOptionLabel = computed(() => {
    const option = this.tabOptions().find((o) => o.value === this.defaultTab());
    return option?.label || 'Seleccionar';
  });

  themeOptionLabel = computed(() => {
    const option = this.themeOptions().find(
      (o) => o.value === this.currentTheme(),
    );
    return option?.label || 'Seleccionar';
  });

  constructor() {
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

  onTabChange(value: string) {
    this.setDefaultTab(value as TabType);
  }

  onThemeChange(value: string) {
    this.setTheme(value as Theme);
  }
}
