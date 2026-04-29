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
    ReleasesComponent,
    ProfileModalComponent,
  ],
  template: `
    <!-- Desktop ≥768px: tres paneles simultáneos -->
    <div class="desktop-shell">
      <app-header (openProfile)="showProfileModal.set(true)" />
      <main class="three-pane">
        <section [class.dim]="activeTab() !== 'releases'">
          @if (activeTab() !== 'releases') {
            <div
              class="panel-overlay"
              (click)="activeTab.set('releases')"
            ></div>
          }
          <app-releases />
        </section>
        <section [class.dim]="activeTab() !== 'search'">
          @if (activeTab() !== 'search') {
            <div class="panel-overlay" (click)="activeTab.set('search')"></div>
          }
          @if (!hasChildRoute()) {
            <app-search />
          } @else {
            <router-outlet />
          }
        </section>
        <section [class.dim]="activeTab() !== 'wishlist'">
          @if (activeTab() !== 'wishlist') {
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
        padding: 16px 8px;
        position: relative;
        overflow-y: auto;
        height: 100%;
        transition: border-color var(--dur-base) var(--ease);
        border-radius: var(--radius-md);
        border: 2px solid var(--bone-900);
      }

      .three-pane > section:not(.dim) {
        border-color: var(--bone);
        box-shadow: 0 0 10px 1px rgba(255, 255, 255, 0.1);
        width: 50%;
      }

      .three-pane > section.dim {
        opacity: 0.2;
        width: 25%;
        filter: blur(1.5px);
      }

      .three-pane > section.dim:hover {
        opacity: 0.5;
        filter: blur(1px);
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

  activeTab = signal<'search' | 'wishlist' | 'releases'>('releases');
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
