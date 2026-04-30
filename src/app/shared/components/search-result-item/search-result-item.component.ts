import { Component, computed, input, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Track } from '../../models/track.model';
import { WishlistEntry } from '../../models/wishlist-entry.model';
import { ReleaseItem } from '../../models/release-item.model';
import { CoverComponent } from '../cover/cover.component';
import { TypeChipComponent } from '../type-chip/type-chip.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { PreviewService } from '../../../core/services/preview.service';
import { PreviewSpinnerComponent } from '../preview-spinner/preview-spinner.component';

@Component({
  selector: 'app-search-result-item',
  standalone: true,
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
  imports: [
    DatePipe,
    CoverComponent,
    TypeChipComponent,
    AvatarComponent,
    PreviewSpinnerComponent,
  ],
  template: `
    @if (source() === 'search') {
      @switch (type()) {
        @case ('artist') {
          <div class="item-row">
            <button
              class="artist-link"
              (click)="onArtistClick.emit(trackItem())"
              [title]="trackItem().name"
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
            @if (showAddButton()) {
              <button
                class="add-btn"
                [class.added]="isAdded()"
                (click)="onAddClick.emit(trackItem())"
                [title]="isAdded() ? 'Quitar de wishlist' : 'Añadir a wishlist'"
              >
                @if (isAdded()) {
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="1"
                  >
                    <path
                      d="M8 14.5c-3.5-2-6-4-6-6.5C2 6 3.5 4.5 5 4.5c1 0 2 .5 3 1.5 1-1 2-1.5 3-1.5 1.5 0 3 1.5 3 3.5 0 2.5-2.5 4.5-6 6.5z"
                    />
                  </svg>
                } @else {
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 14.5c-3.5-2-6-4-6-6.5C2 6 3.5 4.5 5 4.5c1 0 2 .5 3 1.5 1-1 2-1.5 3-1.5 1.5 0 3 1.5 3 3.5 0 2.5-2.5 4.5-6 6.5z"
                      stroke="currentColor"
                      stroke-width="1"
                      stroke-linejoin="round"
                    />
                  </svg>
                }
              </button>
            }
          </div>
        }
        @case ('track') {
          <div class="item-row">
            <button
              class="cover-btn"
              (click)="onPlayPreview(trackItem())"
              [title]="
                previewState().trackId === trackItem().id &&
                previewState().isPlaying
                  ? 'Pausar'
                  : 'Reproducir preview'
              "
              [disabled]="!trackItem().previewUrl"
            >
              <app-cover
                [coverUrl]="trackItem().coverUrl"
                [name]="trackItem().name"
                [size]="56"
              />
              @if (previewState().trackId === trackItem().id) {
                <div class="preview-overlay" @fadeInOut>
                  <app-preview-spinner
                    [progress]="previewState().progress"
                    [isPlaying]="previewState().isPlaying"
                  />
                </div>
              }
            </button>
            <div class="item-meta">
              <span class="item-title">{{ trackItem().name }}</span>
              <div class="item-subtitle">
                <span class="item-artist">{{ trackItem().artists[0] }}</span>
                ·
                <app-type-chip [type]="trackItem().type" />
              </div>
            </div>
            @if (showAddButton()) {
              <button
                class="add-btn"
                [class.added]="isAdded()"
                (click)="onAddClick.emit(trackItem())"
                [title]="isAdded() ? 'Quitar de wishlist' : 'Añadir a wishlist'"
              >
                @if (isAdded()) {
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5L6.5 12L13 5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                } @else {
                  <svg viewBox="0 0 16 16" fill="none">
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
        @if (wishlistItem().type === 'track' && wishlistItem().previewUrl) {
          <button
            class="cover-btn"
            (click)="onPlayPreviewWishlist(wishlistItem())"
            [title]="
              previewState().trackId === wishlistItem().trackId &&
              previewState().isPlaying
                ? 'Pausar'
                : 'Reproducir preview'
            "
          >
            <app-cover
              [coverUrl]="wishlistItem().coverUrl"
              [name]="wishlistItem().name"
              [size]="64"
            />
            @if (
              previewState().trackId === wishlistItem().trackId &&
              (previewState().isPlaying || previewState().isLoading)
            ) {
              <div class="preview-overlay" @fadeInOut>
                <app-preview-spinner
                  [progress]="previewState().progress"
                  [isPlaying]="previewState().isPlaying"
                />
              </div>
            }
          </button>
        } @else {
          <app-cover
            [coverUrl]="wishlistItem().coverUrl"
            [name]="wishlistItem().name"
            [size]="64"
          />
        }
        <div class="item-meta">
          <span class="item-title">{{ wishlistItem().name }}</span>
          <span class="item-subtitle">
            <span class="item-artist">{{ wishlistItem().artist }}</span>
            ·
            <app-type-chip [type]="wishlistItem().type" />
          </span>
          <span class="added-by">
            <app-avatar [name]="wishlistItem().addedBy" [size]="14" />
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
              <svg viewBox="0 0 16 16" fill="none">
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
              <svg viewBox="0 0 16 16" fill="none">
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
              <svg viewBox="0 0 16 16" fill="none">
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
              <svg viewBox="0 0 16 16" fill="none">
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
      .artist-link {
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        flex: 1;
        display: flex;
        align-items: center;
        gap: 12px;
        border-radius: var(--radius-md);
        transition: background var(--dur-fast) var(--ease);
      }

      .artist-link:hover {
        background: var(--ink-100);
      }

      .item-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
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
        font-size: clamp(1rem, 0.8957rem + 0.4049vw, 1.25rem);
        font-weight: 600;
        color: var(--bone-100);
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        height: clamp(1.125rem, 0.9686rem + 0.6073vw, 1.5rem);
        text-overflow: ellipsis;
        font-family: var(--font-display);
      }

      .item-subtitle {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        color: var(--bone-800);
      }

      .item-subtitle {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        color: var(--bone-800);
      }

      .item-artist {
        font-size: clamp(0.8125rem, 0.6822rem + 0.5061vw, 1.125rem);
        color: var(--bone-600);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        height: clamp(0.9375rem, 0.8072rem + 0.5061vw, 1.25rem);
      }

      .item-stat {
        font-size: clamp(0.75rem, 0.6457rem + 0.4049vw, 1rem);
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
        font-size: clamp(0.6875rem, 0.6093rem + 0.3036vw, 0.875rem);
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
        width: clamp(2.25rem, 5vw, 2.75rem);
        height: clamp(2.25rem, 5vw, 2.75rem);
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

      .add-btn svg {
        width: clamp(1.25rem, 3vw, 1.5rem);
        height: clamp(1.25rem, 3vw, 1.5rem);
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
        width: clamp(2rem, 4.5vw, 2.5rem);
        height: clamp(2rem, 4.5vw, 2.5rem);
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

      .action-btn svg {
        width: clamp(1rem, 2.5vw, 1.25rem);
        height: clamp(1rem, 2.5vw, 1.25rem);
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
        font-size: clamp(0.75rem, 0.6457rem + 0.4049vw, 1rem);
        color: var(--bone-600);
        font-family: var(--font-display);
        font-style: italic;
      }

      .cover-btn {
        position: relative;
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
        flex-shrink: 0;
        border-radius: var(--radius-md);
        transition: opacity var(--dur-fast) var(--ease);
      }

      .cover-btn:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .cover-btn:hover:not(:disabled) {
        opacity: 0.8;
      }

      .preview-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.6);
        border-radius: var(--radius-sm);
        backdrop-filter: blur(1.5px);
      }
    `,
  ],
})
export class SearchResultItemComponent {
  private preview = inject(PreviewService);

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
  previewState = computed(() => this.preview.state());

  formatFans(count: number): string {
    if (count >= 1000000)
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000)
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return count.toString();
  }

  onPlayPreview(track: Track): void {
    if (!track.previewUrl) return;
    this.preview.play(track.id, track.previewUrl);
  }

  onPlayPreviewWishlist(entry: WishlistEntry): void {
    if (!entry.previewUrl) return;
    this.preview.play(entry.trackId, entry.previewUrl);
  }
}
