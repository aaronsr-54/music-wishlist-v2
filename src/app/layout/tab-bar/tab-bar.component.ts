import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../shared/icons/icon.component';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [IconComponent],
  template: `
    <nav
      class="flex p-2 pb-6 bg-light dark:bg-dark shadow-[0px_-4px_10px_5px_rgb(0_0_0/10%)] shrink-0 rounded-tl-xl rounded-tr-xl w-full"
    >
      <button
        class="flex items-center justify-center gap-3 border-none cursor-pointer font-body text-sm font-medium tracking-[0.04em] transition-colors duration-fast ease-smooth py-3 rounded-pill"
        [class]="
          activeTab === 'releases'
            ? 'bg-ink text-bone dark:bg-bone dark:text-ink'
            : 'bg-transparent text-ink-700 dark:text-bone-700'
        "
        [style.flex-grow]="activeTab === 'releases' ? 2 : 1"
        (click)="tabChange.emit('releases')"
      >
        <app-icon
          name="music-note"
          class="w-[clamp(1.5rem,3.5vw,2rem)] h-[clamp(1.5rem,3.5vw,2rem)]"
        />
        @if (activeTab === 'releases') {
          <span class="font-display font-bold">LANZAMIENTOS</span>
        }
      </button>
      <button
        class="flex items-center justify-center gap-3 border-none cursor-pointer font-body text-sm font-medium tracking-[0.04em] transition-colors duration-fast ease-smooth py-3 rounded-pill"
        [class]="
          activeTab === 'search'
            ? 'bg-ink text-bone dark:bg-bone dark:text-ink'
            : 'bg-transparent text-ink-700 dark:text-bone-700'
        "
        [style.flex-grow]="activeTab === 'search' ? 2 : 1"
        (click)="tabChange.emit('search')"
      >
        <app-icon
          name="search"
          class="w-[clamp(1.5rem,3.5vw,2rem)] h-[clamp(1.5rem,3.5vw,2rem)]"
        />
        @if (activeTab === 'search') {
          <span class="font-display font-bold">BUSCADOR</span>
        }
      </button>
      <button
        class="flex items-center justify-center gap-3 border-none cursor-pointer font-body text-sm font-medium tracking-[0.04em] transition-colors duration-fast ease-smooth py-3 rounded-pill"
        [class]="
          activeTab === 'wishlist'
            ? 'bg-ink text-bone dark:bg-bone dark:text-ink'
            : 'bg-transparent text-ink-700 dark:text-bone-700'
        "
        [style.flex-grow]="activeTab === 'wishlist' ? 2 : 1"
        (click)="tabChange.emit('wishlist')"
      >
        <app-icon
          name="heart"
          class="w-[clamp(1.5rem,3.5vw,2rem)] h-[clamp(1.5rem,3.5vw,2rem)]"
        />
        @if (activeTab === 'wishlist') {
          <span class="font-display font-bold">WHISLIST</span>
        }
      </button>
    </nav>
  `,
})
export class TabBarComponent {
  @Input({ required: true }) activeTab: 'search' | 'wishlist' | 'releases' =
    'search';
  @Output() tabChange = new EventEmitter<'search' | 'wishlist' | 'releases'>();
}
