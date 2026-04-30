import { Component, effect, inject, signal } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';

import { filter } from 'rxjs';

import { HeaderComponent } from '../layout/header/header.component';
import { TabBarComponent } from '../layout/tab-bar/tab-bar.component';

import { SearchComponent } from '../features/search/search.component';
import { WishlistComponent } from '../features/wishlist/wishlist.component';
import { ReleasesComponent } from '../features/releases/releases.component';

import { ProfileModalComponent } from '../features/profile/profile-modal.component';

type Tab = 'releases' | 'search' | 'wishlist';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,

    HeaderComponent,
    TabBarComponent,

    ReleasesComponent,
    SearchComponent,
    WishlistComponent,

    ProfileModalComponent,
  ],
  template: `
    <!-- DESKTOP -->
    <div class="desktop-shell">
      <app-header (openProfile)="showProfileModal.set(true)" />

      <main class="desktop-layout">
        <aside class="desktop-tabs">
          <button
            class="tab-button"
            [class.active]="activeTab() === 'releases'"
            (click)="activeTab.set('releases')"
          >
            <span class="tab-button-number">01/</span>
            <span class="tab-button-title">LANZAMIENTOS</span>
          </button>

          <button
            class="tab-button"
            [class.active]="activeTab() === 'search'"
            (click)="activeTab.set('search')"
          >
            <span class="tab-button-number">02/</span>
            <span class="tab-button-title">BUSCADOR</span>
          </button>

          <button
            class="tab-button"
            [class.active]="activeTab() === 'wishlist'"
            (click)="activeTab.set('wishlist')"
          >
            <span class="tab-button-number">03/</span>
            <span class="tab-button-title">WHISLIST</span>
          </button>
        </aside>
        <section class="desktop-content">
          @if (hasChildRoute()) {
            <router-outlet />
          } @else {
            @switch (activeTab()) {
              @case ('releases') {
                <app-releases />
              }

              @case ('search') {
                <app-search />
              }

              @case ('wishlist') {
                <app-wishlist />
              }
            }
          }
        </section>
      </main>
    </div>

    <!-- MOBILE -->
    <div class="mobile-shell">
      <app-header (openProfile)="showProfileModal.set(true)" />

      <main class="mobile-content">
        @if (hasChildRoute()) {
          <router-outlet />
        } @else {
          @switch (activeTab()) {
            @case ('releases') {
              <app-releases />
            }

            @case ('search') {
              <app-search />
            }

            @case ('wishlist') {
              <app-wishlist />
            }
          }
        }
      </main>

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
        overflow: hidden;
      }

      /* -------------------- */
      /* DESKTOP */
      /* -------------------- */

      .desktop-shell {
        display: none;
        flex-direction: column;
        height: 100%;
      }

      .desktop-layout {
        display: flex;
        flex: 1;
        overflow: hidden;
        gap: 4rem;
        padding: 12px;
        width: 100%;
        margin-inline: auto;

        @media (min-width: 1400px) {
          margin-inline: 10%;
          width: calc(100% - (10% * 2));
        }
      }

      .desktop-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        border-radius: var(--radius-xl);
        border: 1px solid var(--ink-200);
        box-shadow: 0 2px 12px 4px rgba(0, 0, 0, 0.15);
        height: 100%;
      }

      .desktop-tabs {
        margin-top: 15%;
        width: 300px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .tab-button {
        display: inline-flex;
        gap: 8px;
        color: var(--bone-700);
        font-size: 28px;
        font-weight: 300;
        font-style: italic;
        font-family: var(--font-display);
        cursor: pointer;
        text-transform: uppercase;
        transition:
          transform var(--dur-fast) var(--ease),
          color var(--dur-base) var(--ease);
      }

      .tab-button:hover {
        transform: scale(1.01);
      }

      .tab-button-title {
        flex-shrink: 1;
      }

      .tab-button-number {
        width: 3.5rem;
        text-align: right;
        opacity: 0;
        cursor: auto;
      }

      .tab-button.active .tab-button-title {
        color: var(--bone);
        font-style: normal;
        font-weight: 700;
      }

      .tab-button.active .tab-button-number {
        opacity: 1;
      }

      /* -------------------- */
      /* MOBILE */
      /* -------------------- */

      .mobile-shell {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .mobile-content {
        flex: 1;
        overflow: hidden;
      }

      .mobile-content > * {
        animation: panelEnter var(--dur-base) var(--ease);
      }

      /* -------------------- */
      /* RESPONSIVE */
      /* -------------------- */

      @media (min-width: 768px) {
        .desktop-shell {
          display: flex;
        }

        .mobile-shell {
          display: none;
        }
      }

      /* -------------------- */
      /* SCROLLBAR */
      /* -------------------- */

      .desktop-content::-webkit-scrollbar {
        width: 8px;
      }

      .desktop-content::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
      }
    `,
  ],
})
export class ShellComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeTab = signal<Tab>('releases');

  showProfileModal = signal(false);

  hasChildRoute = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.hasChildRoute.set(!!this.route.firstChild);
      });

    effect(() => {
      this.activeTab();
      this.router.navigate(['']);
    });
  }
}
