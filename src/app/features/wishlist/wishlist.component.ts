import { Component, computed, inject, signal } from '@angular/core';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { WishlistEntry } from '../../shared/models/wishlist-entry.model';
import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

type WishlistTab = 'pending' | 'downloaded';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [SearchResultItemComponent, EmptyStateComponent],
  template: `
    <div class="panel">
      <div class="eyebrow">
        <span class="label"
          ><span class="label--number">03/</span> WISHLIST</span
        >
        <span class="eyebrow-sub">{{ wishlistSvc.total() }} elementos</span>
      </div>

      <div class="segmented">
        <div class="seg-btns">
          <button
            class="seg-btn"
            [class.active]="activeTab() === 'pending'"
            (click)="activeTab.set('pending')"
          >
            Pendientes
            @if (wishlistSvc.pending().length > 0) {
              <span class="count">{{ wishlistSvc.pending().length }}</span>
            }
          </button>
          <button
            class="seg-btn"
            [class.active]="activeTab() === 'downloaded'"
            (click)="activeTab.set('downloaded')"
          >
            Listos
            @if (wishlistSvc.downloaded().length > 0) {
              <span class="count">{{ wishlistSvc.downloaded().length }}</span>
            }
          </button>
        </div>
      </div>

      <div class="list">
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
            [title]="activeTab() === 'pending' ? 'Tu wishlist espera' : 'Nada listo'"
            [subtitle]="activeTab() === 'pending' ? 'Busca canciones y añádelas aquí' : 'Marca canciones como listas para verlas aquí'"
          />
        }
      </div>
    </div>
  `,
  styles: [
    `
      .panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        padding: 0.5rem 1rem 0 1rem;
        gap: 1rem;
      }

      .eyebrow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;

        @media (min-width: 768px) {
          justify-content: flex-end;
        }
      }

      .label {
        font-family: var(--font-display);
        font-size: clamp(0.75rem, 0.6457rem + 0.4049vw, 1rem);
        color: var(--bone);
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;

        @media (min-width: 768px) {
          display: none;
        }
      }

      .label--number {
        color: var(--bone-700);
        font-weight: 400;
        font-style: italic;
      }

      .eyebrow-sub {
        font-family: var(--font-display);
        font-size: clamp(0.75rem, 0.6457rem + 0.4049vw, 1rem);
        color: var(--bone-700);
        letter-spacing: 0.06em;
        font-style: italic;
      }

      .segmented {
        padding: 4px;
        background: var(--ink-200);
        border-radius: var(--radius-pill);
        margin: 12px 0;
      }

      .seg-btns {
        display: flex;
        gap: 4px;
        border-radius: var(--radius-pill);
        overflow: hidden;
      }

      .seg-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: var(--radius-md);
        border: none;
        background: none;
        color: var(--bone-600);
        font-family: var(--font-body);
        font-size: clamp(0.875rem, 0.7707rem + 0.4049vw, 1.125rem);
        font-weight: 600;
        cursor: pointer;
        transition: all var(--dur-fast) var(--ease);
        text-transform: uppercase;
      }

      .seg-btn.active {
        background: var(--bone);
        color: var(--ink);
        font-weight: 700;
      }

      .count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: var(--radius-pill);
        background: var(--ink-100);
        color: var(--bone-600);
        font-size: clamp(0.75rem, 0.6457rem + 0.4049vw, 1rem);
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .seg-btn.active .count {
        background: var(--ink-300);
      }

      .list {
        flex: 1;
        overflow-y: auto;
        scrollbar-width: none;
        padding-bottom: 2rem;
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

      .list::-webkit-scrollbar {
        display: none;
      }

    `,
  ],
})
export class WishlistComponent {
  wishlistSvc = inject(WishlistService);
  activeTab = signal<WishlistTab>('pending');

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
