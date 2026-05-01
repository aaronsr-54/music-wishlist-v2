import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type TabType = 'releases' | 'search' | 'wishlist';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="settings-section">
      <h2 class="section-title">Configuración</h2>

      <div class="setting-item">
        <label class="setting-label">
          <span class="label-text">Tab inicial al abrir</span>
          <select
            class="tab-select"
            [(ngModel)]="defaultTab"
            (change)="saveDefaultTab()"
          >
            <option value="releases">01/ Lanzamientos</option>
            <option value="search">02/ Buscador</option>
            <option value="wishlist">03/ Wishlist</option>
          </select>
        </label>
      </div>
    </section>
  `,
  styles: [
    `
      .settings-section {
        margin-bottom: 32px;
      }

      .section-title {
        font-family: var(--font-display);
        font-size: 16px;
        font-weight: 600;
        color: var(--bone);
        margin: 0 0 16px 0;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .setting-item {
        background: var(--ink-100);
        padding: 16px;
        border-radius: var(--radius-card);
      }

      .setting-label {
        display: flex;
        flex-direction: column;
        gap: 8px;
        cursor: pointer;
      }

      .label-text {
        font-size: 14px;
        font-weight: 600;
        color: var(--bone);
      }

      .tab-select {
        padding: 10px 12px;
        background: var(--ink-200);
        border: 1px solid var(--ink-300);
        border-radius: var(--radius-md);
        color: var(--bone);
        font-family: var(--font-body);
        font-size: 14px;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--bone);
        }

        option {
          background: var(--ink);
          color: var(--bone);
        }
      }
    `,
  ],
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
