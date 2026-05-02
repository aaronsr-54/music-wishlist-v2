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

type Tab = 'releases' | 'search' | 'wishlist';

@Component({
  selector: 'app-shell',
  standalone: true,
  host: {
    class: 'block h-full overflow-hidden',
  },
  imports: [
    RouterOutlet,
    HeaderComponent,
    TabBarComponent,
    ReleasesComponent,
    SearchComponent,
    WishlistComponent,
  ],
  styles: `
    @keyframes panelEnter {
      from {
        opacity: 0;
        transform: translateX(10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .mobile-content > * {
      animation: panelEnter var(--dur-base) var(--ease);
    }
    .desktop-content::-webkit-scrollbar {
      width: 8px;
    }
    .desktop-content::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
    }
  `,
  template: `
    <!-- DESKTOP -->
    <div
      class="hidden bg-bone-300 dark:bg-ink md:flex flex-col h-full
        relative 
        before:content-['']
        before:absolute
        before:-top-1/4
        before:-right-52
        before:w-2/4
        before:h-3/4
        before:pointer-events-none
        before:dark:bg-[radial-gradient(circle,_theme(colors.ink.400)_0%,_transparent_70%)]
        before:bg-[radial-gradient(circle,_theme(colors.bone.400)_0%,_transparent_70%)]"
    >
      <app-header class="z-10" (openProfile)="goToProfile()" />

      <main
        class="z-10 flex flex-1 overflow-hidden gap-16 p-3 w-full mx-auto min-[1400px]:mx-[10%] min-[1400px]:w-[calc(100%-20%)]"
      >
        <aside class="mt-60 w-[300px] flex flex-col items-start">
          <button
            class="inline-flex gap-2 text-ink-700 dark:text-bone-700 text-[28px] font-light italic font-display cursor-pointer uppercase transition-[transform,color] duration-fast ease-smooth border-none bg-transparent p-0 hover:scale-[1.01]"
            [class.active]="activeTab() === 'releases'"
            (click)="activeTab.set('releases')"
          >
            <span
              class="w-14 text-right"
              [class.opacity-0]="activeTab() !== 'releases'"
              >01/</span
            >
            <span
              class="shrink [&.active]:text-ink [&.active]:dark:text-bone [&.active]:font-bold [&.active]:not-italic"
              [class.active]="activeTab() === 'releases'"
              >LANZAMIENTOS</span
            >
          </button>

          <button
            class="inline-flex gap-2 text-ink-700 dark:text-bone-700 text-[28px] font-light italic font-display cursor-pointer uppercase transition-[transform,color] duration-fast ease-smooth border-none bg-transparent p-0 hover:scale-[1.01]"
            (click)="activeTab.set('search')"
          >
            <span
              class="w-14 text-right"
              [class.opacity-0]="activeTab() !== 'search'"
              >02/</span
            >
            <span
              class="shrink [&.active]:text-ink [&.active]:dark:text-bone [&.active]:font-bold [&.active]:not-italic"
              [class.active]="activeTab() === 'search'"
              >BUSCADOR</span
            >
          </button>

          <button
            class="inline-flex gap-2 text-ink-700 dark:text-bone-700 text-[28px] font-light italic font-display cursor-pointer uppercase transition-[transform,color] duration-fast ease-smooth border-none bg-transparent p-0 hover:scale-[1.01]"
            (click)="activeTab.set('wishlist')"
          >
            <span
              class="w-14 text-right"
              [class.opacity-0]="activeTab() !== 'wishlist'"
              >03/</span
            >
            <span
              class="shrink [&.active]:text-ink [&.active]:dark:text-bone [&.active]:font-bold [&.active]:not-italic"
              [class.active]="activeTab() === 'wishlist'"
              >WHISLIST</span
            >
          </button>
        </aside>

        <section
          class="desktop-content flex-1 overflow-y-auto p-4 rounded-xl border border-bone-800 dark:border-ink-200 shadow-[0_2px_12px_4px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_4px_rgba(0,0,0,0.15)] h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10"
        >
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
    <div
      class="bg-bone-300 dark:bg-ink flex flex-col h-full md:hidden 
        relative 
        before:content-['']
        before:absolute
        before:-top-1/4
        before:-right-1/4
        before:w-3/4
        before:h-2/4
        before:rounded-full
        before:pointer-events-none
        before:dark:bg-[radial-gradient(circle,_theme(colors.ink.400)_0%,_transparent_70%)]
        before:bg-[radial-gradient(circle,_theme(colors.bone.400)_0%,_transparent_70%)]"
    >
      <app-header class="z-10" (openProfile)="goToProfile()" />

      <main class="z-10 mobile-content flex-1 overflow-hidden px-4">
        @switch (activeTab()) {
          @case ('releases') {
            <app-releases />
          }
          @case ('search') {
            @if (hasChildRoute()) {
              <router-outlet />
            } @else {
              <app-search />
            }
          }
          @case ('wishlist') {
            <app-wishlist />
          }
        }
      </main>

      <app-tab-bar
        [activeTab]="activeTab()"
        (tabChange)="activeTab.set($event)"
      />
    </div>
  `,
})
export class ShellComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab = signal<Tab>(this.getDefaultTab());
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

  private getDefaultTab(): Tab {
    const saved = localStorage.getItem('defaultTab') as Tab | null;
    return saved && ['releases', 'search', 'wishlist'].includes(saved)
      ? saved
      : 'releases';
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
