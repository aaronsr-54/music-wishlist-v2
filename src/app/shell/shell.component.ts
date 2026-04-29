import { Component, signal, inject, effect } from '@angular/core';
import {
  RouterOutlet,
  ActivatedRoute,
  NavigationEnd,
  Router,
} from '@angular/router';
import { HeaderComponent } from '../layout/header/header.component';
import { TabBarComponent } from '../layout/tab-bar/tab-bar.component';
import { SearchComponent } from '../features/search/search.component';
import { WishlistComponent } from '../features/wishlist/wishlist.component';
import { ReleasesComponent } from '../features/releases/releases.component';
import { ProfileModalComponent } from '../features/profile/profile-modal.component';
import { filter } from 'rxjs';

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
    <!-- Desktop ≥768px: tres paneles simultáneos -->
    <div class="desktop-shell">
      <app-header (openProfile)="showProfileModal.set(true)" />
      <main class="three-pane">
        <section>
          <app-releases />
        </section>
        <section>
          @if (!hasChildRoute()) {
            <app-search />
          } @else {
            <router-outlet />
          }
        </section>
        <section>
          <app-wishlist />
        </section>
      </main>
    </div>

    <!-- Mobile <768px: header + panel único + tab bar -->
    <div class="mobile-shell">
      <app-header (openProfile)="showProfileModal.set(true)" />
      <div class="mobile-content">
        @if (hasChildRoute()) {
          <router-outlet />
        } @else {
          @switch (activeTab()) {
            @case ('search') {
              <app-search />
            }
            @case ('wishlist') {
              <app-wishlist />
            }
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

      .mobile-content > * {
        animation: panelEnter var(--dur-base) var(--ease) both;
      }

      @media (min-width: 768px) {
        .desktop-shell {
          display: flex;
        }
        .mobile-shell {
          display: none;
        }
      }

      .three-pane {
        display: flex;
        width: 100dvw;
        flex: 1;
        overflow: hidden;
        padding: 12px;
        gap: 12px;
      }

      .three-pane > section {
        flex: 1;
        padding: 0;
        position: relative;
        overflow-y: auto;
        height: 100%;
        transition: border-color var(--dur-base) var(--ease);
        border: 2px solid var(--bone);
        border-radius: var(--radius-md);
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeTab = signal<'search' | 'wishlist'>('search');
  showProfileModal = signal(false);
  hasChildRoute = signal(false);

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.hasChildRoute.set(!!this.route.firstChild);
      });
  }
}
