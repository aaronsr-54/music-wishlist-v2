import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type TabType = 'releases' | 'search' | 'wishlist';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="px-2 mb-6">
      <h3
        class="font-display text-[clamp(0.6875rem,0.6093rem+0.3036vw,0.875rem)] font-bold text-bone-700 mt-0 mb-3 uppercase tracking-[0.06em]"
      >
        Configuración
      </h3>

      <label class="flex items-center gap-3 py-4 border-b border-ink-100 cursor-pointer">
        <span class="flex-1 text-sm font-semibold text-bone">Tab inicial al abrir</span>
        <select
          [(ngModel)]="defaultTab"
          (change)="saveDefaultTab()"
          class="bg-transparent border-none outline-none text-bone font-body text-sm cursor-pointer transition-colors duration-fast hover:opacity-80"
        >
          <option value="releases">01/ Lanzamientos</option>
          <option value="search">02/ Buscador</option>
          <option value="wishlist">03/ Wishlist</option>
        </select>
      </label>
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
