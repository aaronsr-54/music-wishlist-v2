import { Component, computed, inject, signal } from '@angular/core';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { WishlistEntry } from '../../shared/models/wishlist-entry.model';
import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';

type WishlistTab = 'pending' | 'downloaded';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [SearchResultItemComponent],
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
          <div class="empty-state">
            <div class="empty-icon">
              @if (activeTab() === 'pending') {
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M16 4v24M4 16h24"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              } @else {
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M6 17L13 24L26 8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              }
            </div>
            @if (activeTab() === 'pending') {
              <p class="empty-title">Tu wishlist espera</p>
              <p class="empty-sub">Busca canciones y añádelas aquí</p>
            } @else {
              <p class="empty-title">Nada listo</p>
              <p class="empty-sub">
                Marca canciones como listas para verlas aquí
              </p>
            }
          </div>
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
        padding: 0.5rem 1rem;
        gap: 1rem;
      }

      .eyebrow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .label {
        font-family: var(--font-display);
        font-size: 12px;
        color: var(--bone);
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .label--number {
        color: var(--bone-700);
        font-weight: 400;
        font-style: italic;
      }

      .eyebrow-sub {
        font-family: var(--font-display);
        font-size: 12px;
        color: var(--bone-700);
        letter-spacing: 0.06em;
        font-style: italic;
      }

      .segmented {
        padding: 4px;
        background: var(--ink-200);
        border-radius: var(--radius-pill);
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
        font-size: 13px;
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
        font-size: 10px;
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
        -webkit-mask-image: linear-gradient(
          to bottom,
          transparent 0%,
          black 16px,
          black 88%,
          transparent 100%
        );
        mask-image: linear-gradient(
          to bottom,
          transparent 0%,
          black 16px,
          black 88%,
          transparent 100%
        );
        padding: 1rem;
      }

      .list::-webkit-scrollbar {
        display: none;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 60px 20px;
        text-align: center;
        animation: emptyEnter var(--dur-slow) var(--ease) both;
      }

      .empty-icon {
        color: var(--bone-700);
        margin-bottom: 4px;
      }

      .empty-title {
        font-family: var(--font-body);
        font-size: 22px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--bone);
        margin: 0;
      }

      .empty-sub {
        font-size: 14px;
        font-family: var(--font-display);
        color: var(--bone-600);
        font-style: italic;
        margin: 0;
        max-width: 240px;
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
