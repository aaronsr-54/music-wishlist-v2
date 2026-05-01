import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type TabType = 'releases' | 'search' | 'wishlist';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mb-8">
      <h2 class="font-display text-base font-semibold text-bone mt-0 mb-4 uppercase tracking-wider">
        Configuración
      </h2>

      <div class="bg-ink-100 p-4 rounded-card">
        <label class="flex flex-col gap-2 cursor-pointer">
          <span class="text-sm font-semibold text-bone">Tab inicial al abrir</span>
          <select
            [(ngModel)]="defaultTab"
            (change)="saveDefaultTab()"
            class="px-3 py-2.5 bg-ink-200 border border-ink-300 rounded-md text-bone font-body text-sm cursor-pointer focus:outline-none focus:border-bone transition-colors duration-fast"
          >
            <option value="releases">01/ Lanzamientos</option>
            <option value="search">02/ Buscador</option>
            <option value="wishlist">03/ Wishlist</option>
          </select>
        </label>
      </div>
    </section>
  `,
})
export class ProfileSettingsComponent {
  defaultTab = signal<TabType>('releases');

  constructor() {
    const saved = localStorage.getItem('defaultTab') as TabType | null;
    if (saved) {
      this.defaultTab.set(saved);
    }
  }

  saveDefaultTab() {
    localStorage.setItem('defaultTab', this.defaultTab());
  }
}
