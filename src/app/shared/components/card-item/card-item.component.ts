import { Component, computed, input, output } from '@angular/core';
import { ReleaseItem } from '../../models/release-item.model';
import { CoverComponent } from '../cover/cover.component';
import { TypeChipComponent } from '../type-chip/type-chip.component';

@Component({
  selector: 'app-card-item',
  standalone: true,
  imports: [CoverComponent, TypeChipComponent],
  template: `
    <div class="card">
      <app-cover
        [coverUrl]="releaseItem().coverUrl"
        [name]="releaseItem().name"
      />
      <div class="item-meta">
        <div class="item-stats">
          <span class="release-date">{{ releaseItem().releaseDate }}</span>
          <app-type-chip [type]="releaseItem().type" />
        </div>
        <div class="item-content">
          <span class="item-title">{{ releaseItem().name }}</span>
          <span class="item-artist">{{ releaseItem().artist }}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="action-btn open-url" (click)="onOpenUrl()" title="Abrir en YouTube">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M3 2L13 8L3 14V2Z" fill="currentColor" stroke="currentColor" stroke-width="0.5" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="action-btn add-to-wishlist" [class.added]="isAdded()" (click)="onToggleWishlist()" [title]="isAdded() ? 'Quitar de wishlist' : 'Añadir a wishlist'">
          @if (isAdded()) {
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" stroke="currentColor" stroke-width="1">
              <path d="M8 14.5c-3.5-2-6-4-6-6.5C2 6 3.5 4.5 5 4.5c1 0 2 .5 3 1.5 1-1 2-1.5 3-1.5 1.5 0 3 1.5 3 3.5 0 2.5-2.5 4.5-6 6.5z"/>
            </svg>
          } @else {
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M8 14.5c-3.5-2-6-4-6-6.5C2 6 3.5 4.5 5 4.5c1 0 2 .5 3 1.5 1-1 2-1.5 3-1.5 1.5 0 3 1.5 3 3.5 0 2.5-2.5 4.5-6 6.5z" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>
            </svg>
          }
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        display: flex;
        flex-direction: column;
        padding: 8px;
        border-radius: var(--radius-md);
        background: var(--ink-200);
        gap: 4px;
        width: 100%;
        overflow: hidden;
      }

      .item-meta {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }

      .item-stats {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--bone-800);
      }

      .item-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .item-title {
        max-width: 100%;
        font-size: 14px;
        font-weight: 600;
        color: var(--bone-100);
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: var(--font-display);
      }

      .item-artist {
        max-width: 100%;
        font-size: 12px;
        color: var(--bone-600);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .release-date {
        font-size: 12px;
        color: var(--bone-600);
        font-family: var(--font-display);
        font-style: italic;
      }

      .item-actions {
        display: flex;
        gap: 6px;
        margin-top: 4px;
        justify-content: flex-end;
      }

      .action-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bone-600);
        transition:
          background var(--dur-fast) var(--ease),
          color var(--dur-fast) var(--ease),
          transform var(--dur-fast) var(--ease);
        padding: 0;
        flex-shrink: 0;
      }

      .action-btn:hover {
        background: var(--ink-200);
        color: var(--bone-100);
      }

      .action-btn:active {
        transform: scale(0.82);
      }

      .action-btn.added {
        background: var(--bone);
        color: var(--ink);
        animation: popIn 220ms var(--ease) both;
      }

      .open-url {
        color: var(--bone-600);
      }
    `,
  ],
})
export class CardItemComponent {
  item = input.required<ReleaseItem>();
  isAdded = input(false);
  showTypeChip = input(true);

  openUrl = output<ReleaseItem>();
  toggleWishlist = output<ReleaseItem>();

  releaseItem = computed(() => {
    return this.item() as ReleaseItem;
  });

  onOpenUrl() {
    this.openUrl.emit(this.item());
  }

  onToggleWishlist() {
    this.toggleWishlist.emit(this.item());
  }
}
