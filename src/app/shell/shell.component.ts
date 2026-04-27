import { Component, signal } from '@angular/core';
import { HeaderComponent } from '../layout/header/header.component';
import { TabBarComponent } from '../layout/tab-bar/tab-bar.component';
import { SearchComponent } from '../features/search/search.component';
import { WishlistComponent } from '../features/wishlist/wishlist.component';
import { ProfileModalComponent } from '../features/profile/profile-modal.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    HeaderComponent,
    TabBarComponent,
    SearchComponent,
    WishlistComponent,
    ProfileModalComponent,
  ],
  template: `
    <!-- Desktop ≥768px: dos paneles simultáneos -->
    <div class="desktop-shell">
      <app-header (openProfile)="showProfileModal.set(true)" />
      <main class="two-pane">
        <section [class.dim]="activeTab() !== 'search'">
          @if (activeTab() !== 'search') {
            <div class="panel-overlay" (click)="activeTab.set('search')"></div>
          }
          <app-search />
        </section>
        <section [class.dim]="activeTab() === 'search'">
          @if (activeTab() === 'search') {
            <div
              class="panel-overlay"
              (click)="activeTab.set('wishlist')"
            ></div>
          }
          <app-wishlist />
        </section>
      </main>
    </div>

    <!-- Mobile <768px: header + panel único + tab bar -->
    <div class="mobile-shell">
      <app-header (openProfile)="showProfileModal.set(true)" />
      <div class="mobile-content">
        @switch (activeTab()) {
          @case ('search') {
            <app-search />
          }
          @case ('wishlist') {
            <app-wishlist />
          }
        }
      </div>
      <app-tab-bar
        [activeTab]="activeTab()"
        (tabChange)="activeTab.set($event)"
      />
    </div>

    <app-profile-modal
      [isOpen]="showProfileModal"
      (closed)="showProfileModal.set(false)"
    />
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .desktop-shell {
        display: none;
        flex-direction: column;
        height: 100%;
      }

      .mobile-shell {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .mobile-content {
        flex: 1;
        overflow: hidden;
      }

      @media (min-width: 768px) {
        .desktop-shell {
          display: flex;
        }
        .mobile-shell {
          display: none;
        }
      }

      .two-pane {
        display: flex;
        width: 100dvw;
        flex: 1;
        overflow: hidden;
      }

      .two-pane > section {
        position: relative;
        overflow-y: auto;
        height: 100%;
        transition:
          opacity var(--dur-base) var(--ease),
          border-color var(--dur-base) var(--ease);
        border: 2px solid transparent;
        border-radius: var(--radius-sm);
      }

      .two-pane > section:not(.dim) {
        border-color: var(--bone);
        flex-grow: 1;
      }

      .two-pane > section.dim {
        opacity: 0.2;
        width: 35%;
        filter: blur(1px);
      }

      .two-pane > section.dim:hover {
        opacity: 0.5;
      }

      .panel-overlay {
        position: absolute;
        inset: 0;
        cursor: pointer;
        z-index: 10;
      }
    `,
  ],
})
export class ShellComponent {
  activeTab = signal<'search' | 'wishlist'>('search');
  showProfileModal = signal(false);
}
