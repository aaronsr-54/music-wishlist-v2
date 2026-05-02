import { Component, computed, inject, signal } from '@angular/core';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { WishlistEntry } from '../../shared/models/wishlist-entry.model';
import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import {
  SegmentedTabsComponent,
  SegmentedTabOption,
} from '../../shared/components/segmented-tabs/segmented-tabs.component';

type WishlistTab = 'pending' | 'downloaded';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    SearchResultItemComponent,
    EmptyStateComponent,
    SegmentedTabsComponent,
  ],
  styles: `
    .scroll-fade {
      flex: 1;
      overflow-y: auto;
      scrollbar-width: none;
      padding-bottom: 2rem;
      padding-top: 4px;
      -webkit-mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 16px,
        black 95%,
        transparent 100%
      );
      mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 16px,
        black 95%,
        transparent 100%
      );
    }

    .scroll-fade::-webkit-scrollbar {
      display: none;
    }
  `,
  template: `
    <div class="flex flex-col h-full overflow-hidden p-0.5 pt-2 gap-4">
      <div class="flex items-center justify-between gap-2 md:justify-end">
        <span
          class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink dark:text-bone font-bold tracking-[0.06em] uppercase md:hidden"
        >
          <span class="text-ink-700 dark:text-bone-700 font-normal italic">
            03/
          </span>
          WISHLIST
        </span>

        <span
          class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink-700 dark:text-bone-700 tracking-[0.06em] italic"
        >
          {{ wishlistSvc.total() }} elementos
        </span>
      </div>

      <app-segmented-tabs
        variant="toggle"
        [options]="tabs"
        [value]="activeTab()"
        (valueChange)="activeTab.set($event)"
      />

      <div class="scroll-fade">
        @for (entry of activeEntries(); track entry.id) {
          <app-search-result-item
            [item]="entry"
            source="wishlist"
            [wishlistStatus]="
              activeTab() === 'pending' ? 'pending' : 'downloaded'
            "
            (onMarkDownloaded)="markDownloaded($event)"
            (onUnmarkDownloaded)="unmarkDownloaded($event)"
            (onRemove)="remove($event)"
          />
        } @empty {
          <app-empty-state
            [icon]="activeTab() === 'pending' ? 'plus' : 'check'"
            [title]="
              activeTab() === 'pending' ? 'Tu wishlist espera' : 'Nada listo'
            "
            [subtitle]="
              activeTab() === 'pending'
                ? 'Busca canciones y añádelas aquí'
                : 'Marca canciones como listas para verlas aquí'
            "
          />
        }
      </div>
    </div>
  `,
})
export class WishlistComponent {
  wishlistSvc = inject(WishlistService);

  activeTab = signal<WishlistTab>('pending');

  tabs: SegmentedTabOption<WishlistTab>[] = [
    {
      value: 'pending',
      label: 'Pendientes',
    },
    {
      value: 'downloaded',
      label: 'Listos',
    },
  ];

  activeEntries = computed(() =>
    this.activeTab() === 'pending'
      ? this.wishlistSvc.pending()
      : this.wishlistSvc.downloaded(),
  );

  async markDownloaded(entry: WishlistEntry) {
    if (entry.id) await this.wishlistSvc.markDownloaded(entry.id);
  }

  async unmarkDownloaded(entry: WishlistEntry) {
    if (entry.id) await this.wishlistSvc.unmarkDownloaded(entry.id);
  }

  async remove(entry: WishlistEntry) {
    if (entry.id) await this.wishlistSvc.remove(entry.id);
  }
}
