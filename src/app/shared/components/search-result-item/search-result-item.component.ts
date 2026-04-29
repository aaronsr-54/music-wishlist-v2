import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Track } from '../../models/track.model';
import { WishlistEntry } from '../../models/wishlist-entry.model';
import { ReleaseItem } from '../../models/release-item.model';
import { CoverComponent } from '../cover/cover.component';
import { TypeChipComponent } from '../type-chip/type-chip.component';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-search-result-item',
  standalone: true,
  imports: [DatePipe, CoverComponent, TypeChipComponent, AvatarComponent],
  template: `
    @if (source() === 'releases') {
      <div class="item-row">
        <app-cover
          [coverUrl]="releaseItem().coverUrl"
          [name]="releaseItem().name"
          [size]="56"
        />
        <div class="item-meta">
          <span class="item-title">{{ releaseItem().name }}</span>
          <div class="item-subtitle">
            <span class="item-artist">{{ releaseItem().artist }}</span>
            ·
            <app-type-chip [type]="releaseItem().type" />
            ·
            <span class="release-date">{{ releaseItem().releaseDate }}</span>
          </div>
        </div>
      </div>
    } @else if (source() === 'search') {
      @switch (type()) {
        @case ('artist') {
          <button
            class="item-row artist-row"
            (click)="onArtistClick.emit(trackItem())"
          >
            <app-cover
              [coverUrl]="trackItem().coverUrl"
              [name]="trackItem().name"
              [size]="56"
            />
            <div class="item-meta">
              <span class="item-title">{{ trackItem().name }}</span>
              <div class="item-subtitle">
                @if (trackItem().fanCount) {
                  <span class="item-stat item-stat--fans"
                    ><b>
                      {{ formatFans(trackItem().fanCount ?? 0) }}
                    </b>
                    fan{{ trackItem().fanCount !== 1 ? 's' : '' }}</span
                  >
                  <span class="item-sep">·</span>
                }
                @if (trackItem().albumCount) {
                  <span class="item-stat item-stat--albums">
                    {{ trackItem().albumCount }}
                    álbum{{ trackItem().albumCount !== 1 ? 's' : '' }}</span
                  >
                }
              </div>
            </div>
          </button>
        }
        @case ('track') {
          <div class="item-row">
            <app-cover
              [coverUrl]="trackItem().coverUrl"
              [name]="trackItem().name"
              [size]="56"
            />
            <div class="item-meta">
              <span class="item-title">{{ trackItem().name }}</span>
              <div class="item-subtitle">
                <span class="item-artist">{{
                  trackItem().artists[0]
                }}</span>
                ·
                <app-type-chip [type]="trackItem().type" />
              </div>
            </div>
            @if (showAddButton()) {
              <button
                class="add-btn"
                [class.added]="isAdded()"
                (click)="onAddClick.emit(trackItem())"
                [title]="
                  isAdded() ? 'Quitar de wishlist' : 'Añadir a wishlist'
                "
              >
                @if (isAdded()) {
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5L6.5 12L13 5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                } @else {
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M8 3V13M3 8H13"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                }
              </button>
            }
          </div>
        }
      }
    } @else {
      <div class="item-row wishlist-row">
        <app-cover
          [coverUrl]="wishlistItem().coverUrl"
          [name]="wishlistItem().name"
          [size]="64"
        />
        <div class="item-meta">
          <span class="item-title">{{ wishlistItem().name }}</span>
          <span class="item-subitle">
            <span class="item-artist">{{
              wishlistItem().artist
            }}</span>
            ·
            <app-type-chip [type]="wishlistItem().type" />
          </span>
          <span class="added-by">
            <app-avatar
              [name]="wishlistItem().addedBy"
              [size]="14"
            />
            {{ wishlistItem().addedBy }} ·
            <span class="added-date">{{
              wishlistItem().addedAt | date: 'd MMM'
            }}</span>
          </span>
        </div>
        <div class="actions">
          @if (wishlistStatus() === 'pending') {
            <button
              class="action-btn"
              (click)="onMarkDownloaded.emit(wishlistItem())"
              title="Marcar como listo"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8.5L6.5 12L13 5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <button
              class="action-btn action-danger"
              (click)="onRemove.emit(wishlistItem())"
              title="Eliminar"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M4 4L12 12M12 4L4 12"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          } @else {
            <button
              class="action-btn"
              (click)="onUnmarkDownloaded.emit(wishlistItem())"
              title="Mover a pendientes"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 4L6 8L10 12"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <button
              class="action-btn action-danger"
              (click)="onRemove.emit(wishlistItem())"
              title="Eliminar"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M5 3h6M3 5h10M5 5v7a1 1 0 001 1h4a1 1 0 001-1V5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .artist-row {
        background: none;
        border: none;
        cursor: pointer;
        padding: 10px 8px;
        text-align: left;
        width: 100%;
      }

      .artist-row:hover {
        background: var(--ink-100);
        border-radius: var(--radius-md);
        transition: border-radius var(--dur-fast) var(--ease);
      }

      .item-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 8px;
        border-bottom: 1px solid var(--ink-200);
        transition: background var(--dur-fast) var(--ease);
      }

      .item-row.wishlist-row {
        padding: 12px 8px;
        margin: 0 -8px;
        animation: rowEnter var(--dur-base) var(--ease) both;
      }

      .item-meta {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .item-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--bone-100);
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        height: 18px;
        text-overflow: ellipsis;
        font-family: var(--font-display);
      }

      .item-subtitle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bone-800);
      }

      .item-subitle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bone-800);
      }

      .item-artist {
        font-size: 13px;
        color: var(--bone-600);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        height: 15px;
      }

      .item-stat {
        font-size: 12px;
        color: var(--bone-700);
      }

      .item-stat--albums {
        font-family: var(--font-display);
        font-style: italic;
      }

      .item-sep {
        color: var(--bone-800);
      }

      .added-by {
        font-size: 11px;
        color: var(--bone-800);
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
        font-weight: 600;
      }

      .added-date {
        font-family: var(--font-display);
        font-weight: 400;
        font-style: italic;
      }

      .add-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bone-600);
        flex-shrink: 0;
        transition:
          background var(--dur-fast) var(--ease),
          color var(--dur-fast) var(--ease),
          transform var(--dur-fast) var(--ease);
        border: none;
        background: none;
        padding: 0;
      }

      .add-btn:hover {
        background: var(--ink-200);
        color: var(--bone-100);
      }

      .add-btn:active {
        transform: scale(0.82);
      }

      .add-btn.added {
        background: var(--bone);
        color: var(--ink);
        animation: popIn 220ms var(--ease) both;
      }

      .actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      .action-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1.5px solid var(--ink-100);
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bone-600);
        transition:
          border-color var(--dur-fast) var(--ease),
          color var(--dur-fast) var(--ease),
          transform var(--dur-fast) var(--ease);
      }

      .action-btn:hover {
        border-color: var(--bone-400);
        color: var(--bone);
        transform: scale(1.1);
      }

      .action-btn:active {
        transform: scale(0.88);
      }

      .action-btn.action-danger:hover {
        border-color: #e57373;
        color: #e57373;
        transform: scale(1.1);
      }

      .release-date {
        font-size: 12px;
        color: var(--bone-600);
        font-family: var(--font-display);
        font-style: italic;
      }
    `,
  ],
})
export class SearchResultItemComponent {
  item = input.required<Track | WishlistEntry | ReleaseItem>();
  source = input<'search' | 'wishlist' | 'releases'>('search');
  type = input<'artist' | 'track'>('track');
  isAdded = input(false);
  showAddButton = input(true);
  showTypeChip = input(true);
  wishlistStatus = input<'pending' | 'downloaded'>('pending');

  onArtistClick = output<Track>();
  onAddClick = output<Track>();
  onMarkDownloaded = output<WishlistEntry>();
  onUnmarkDownloaded = output<WishlistEntry>();
  onRemove = output<WishlistEntry>();

  trackItem = computed(() => this.item() as Track);
  wishlistItem = computed(() => this.item() as WishlistEntry);
  releaseItem = computed(() => this.item() as ReleaseItem);

  formatFans(count: number): string {
    if (count >= 1000000)
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000)
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return count.toString();
  }
}
