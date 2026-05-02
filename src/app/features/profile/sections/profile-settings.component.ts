import {
  Component,
  signal,
  ChangeDetectionStrategy,
  computed,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileSectionComponent } from '../../../shared/components/profile-section/profile-section.component';
import { SegmentedTabsComponent } from '../../../shared/components/segmented-tabs/segmented-tabs.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-profile-section title="Configuración">
      <section
        class="border border-solid border-bone-800 dark:border-ink-200 rounded-lg p-4 flex flex-col gap-8"
      >
        <!-- TAB -->
        <div class="flex flex-col md:flex-row gap-2 md:items-center">
          <span class="md:min-w-36 italic text-ink-700 dark:text-bone-700">
            Página principal:
          </span>

          <button
            class="md:hidden w-full px-4 py-2 rounded-lg bg-bone dark:bg-ink-200 dark:text-bone font-bold uppercase"
            (click)="openTabModal()"
          >
            {{ tabOptionLabel() }}
          </button>

          <app-segmented-tabs
            class="hidden md:flex flex-1"
            variant="toggle"
            [options]="tabOptions()"
            [value]="defaultTab()"
            (valueChange)="setDefaultTab($event)"
          />
        </div>

        <!-- THEME -->
        <div class="flex flex-col md:flex-row gap-2 md:items-center">
          <span class="md:min-w-36 italic text-ink-700 dark:text-bone-700">
            Tema:
          </span>

          <button
            class="md:hidden w-full px-4 py-2 rounded-lg bg-bone dark:bg-ink-200 dark:text-bone font-bold uppercase"
            (click)="openThemeModal()"
          >
            {{ themeOptionLabel() }}
          </button>

          <app-segmented-tabs
            class="hidden md:flex flex-1"
            variant="toggle"
            [options]="themeOptions()"
            [value]="currentTheme()"
            (valueChange)="setTheme($event)"
          />
        </div>
      </section>

      <!-- MODAL TAB -->
      <app-modal #tabModal title="Página principal" (onClose)="closeTabModal()">
        <app-segmented-tabs
          variant="list"
          [options]="tabOptions()"
          [value]="defaultTab()"
          (valueChange)="onTabChange($event)"
        />
      </app-modal>

      <!-- MODAL THEME -->
      <app-modal #themeModal title="Tema" (onClose)="closeThemeModal()">
        <app-segmented-tabs
          variant="list"
          [options]="themeOptions()"
          [value]="currentTheme()"
          (valueChange)="onThemeChange($event)"
        />
      </app-modal>
    </app-profile-section>
  `,
})
export class ProfileSettingsComponent {
  private themeService = inject(ThemeService);

  @ViewChild('tabModal', { static: true }) tabModal!: ModalComponent;
  @ViewChild('themeModal', { static: true }) themeModal!: ModalComponent;

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

  tabOptionLabel = computed(
    () =>
      this.tabOptions().find((o) => o.value === this.defaultTab())?.label ??
      'Seleccionar',
  );

  themeOptionLabel = computed(
    () =>
      this.themeOptions().find((o) => o.value === this.currentTheme())?.label ??
      'Seleccionar',
  );

  constructor() {
    const saved = localStorage.getItem('defaultTab') as TabType | null;
    if (saved) this.defaultTab.set(saved);

    this.currentTheme.set(this.themeService.getTheme());
  }

  // -------------------
  // MODAL CONTROL
  // -------------------

  openTabModal() {
    this.tabModal.open();
  }

  closeTabModal() {
    this.tabModal.close();
  }

  openThemeModal() {
    this.themeModal.open();
  }

  closeThemeModal() {
    this.themeModal.close();
  }

  // -------------------
  // STATE
  // -------------------

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
    this.closeTabModal();
  }

  onThemeChange(value: string) {
    this.setTheme(value as Theme);
    this.closeThemeModal();
  }
}
