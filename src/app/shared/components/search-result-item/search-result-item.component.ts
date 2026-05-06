import { Component, computed, inject, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';

import { fadeInOut } from '../../animations/animations';

import { Track } from '../../models/track.model';
import { WishlistEntry } from '../../models/wishlist-entry.model';
import { ReleaseItem } from '../../models/release-item.model';

import { CoverComponent } from '../cover/cover.component';
import { TypeChipComponent } from '../type-chip/type-chip.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { IconComponent } from '../../icons/icon.component';
import { ButtonComponent } from '../button/button.component';

import { PreviewService } from '../../../core/services/preview.service';
import { SearchService } from '../../../core/api/search.service';
import { LanguageService } from '../../../core/i18n/language.service';

import { formatFans } from '../../utils/format-fans';

type SearchItemType = 'artist' | 'track' | 'album' | 'ep' | 'single';
type WishlistEntryExtended = WishlistEntry & {
  isOwner?: boolean;
};

@Component({
  selector: 'app-search-result-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut()],
  imports: [
    DatePipe,
    NgClass,
    CoverComponent,
    TypeChipComponent,
    AvatarComponent,
    IconComponent,
    ButtonComponent,
  ],
  template: `
    @if (isArtist()) {
      <div
        class="flex items-center gap-3 py-2.5 border-b border-bone-200 dark:border-ink-200"
      >
        <button
          class="bg-transparent border-none cursor-pointer text-left flex-1 flex items-center gap-3 rounded-md hover:bg-bone-100 dark:hover:bg-ink-100 p-0 transition-colors"
          (click)="onArtistClick.emit(trackItem())"
        >
          <app-cover [coverUrl]="coverUrl()" [name]="title()" [size]="56" />

          <div class="flex-1 flex flex-col gap-[3px] min-w-0">
            <span class="search-result-title">
              {{ title() }}
            </span>

            <div
              class="flex items-baseline gap-2 leading-none text-ink-800 dark:text-bone-800"
            >
              @if (trackItem().fanCount) {
                <span class="search-result-meta">
                  <b>{{ formatFans(trackItem().fanCount ?? 0) }}</b>
                  fan{{ trackItem().fanCount !== 1 ? 's' : '' }}
                </span>

                <span>·</span>
              }

              @if (trackItem().albumCount) {
                <span class="meta italic">
                  {{ trackItem().albumCount }}
                  álbum{{ trackItem().albumCount !== 1 ? 's' : '' }}
                </span>
              }
            </div>
          </div>
        </button>

        @if (showAddButton()) {
          <button
            appBtn
            variant="add"
            [added]="isAdded()"
            (click)="onAdd(trackItem(), $event)"
          >
            <app-icon
              [name]="isAdded() ? 'heart-filled' : 'heart'"
              class="search-result-action-icon"
            />
          </button>
        }
      </div>
    } @else {
      <div
        class="group flex items-center gap-3 py-2.5 border-b border-bone-200 dark:border-ink-200 rounded-md -mx-2 px-2 cursor-pointer transition-colors"
        (click)="handleItemClick()"
      >
        <!-- COVER / TRACK NUMBER -->

        @if (
          showTrackNumber() && trackItem().trackNumber != null && !isWishlist()
        ) {
          <div
            class="shrink-0 w-7 h-9 md:h-14 flex justify-end text-ink dark:text-bone"
            [class.opacity-40]="!hasPreview()"
          >
            <span
              class="font-display text-[clamp(1rem,0.9rem+0.5vw,1.375rem)] font-semibold tabular-nums"
              [ngClass]="accentClasses()"
            >
              {{ trackItem().trackNumber }}.
            </span>
          </div>
        } @else {
          <div
            class="shrink-0 rounded-md overflow-hidden"
            [class.opacity-60]="!hasPreview()"
          >
            <app-cover
              [coverUrl]="coverUrl()"
              [name]="title()"
              [size]="coverSize()"
            />
          </div>
        }

        <!-- CONTENT -->

        <div class="flex-1 flex flex-col gap-2 min-w-0">
          <div class="flex flex-col ">
            <span
              class="title transition-colors duration-fast"
              [ngClass]="accentClasses()"
            >
              {{ title() }}
            </span>

            <div
              class="flex items-center gap-2 leading-none text-ink-800 dark:text-bone-800"
            >
              <span
                class="search-result-meta whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-fast"
                [ngClass]="accentClasses()"
              >
                {{ subtitle() }}
              </span>

              @if (showTypeChip()) {
                ·
                <app-type-chip [type]="itemType()" />
              }
            </div>
          </div>

          @if (isWishlist()) {
            <span
              class="text-[clamp(0.6875rem,0.6093rem+0.3036vw,0.875rem)] text-ink-200 dark:text-bone-800 flex items-center gap-1 flex-wrap font-semibold"
            >
              <app-avatar [name]="wishlistItem().addedBy" [size]="14" />

              {{ isShared() ? wishlistItem().addedBy : 'Yo' }}

              @if (isShared()) {
                ·

                <span
                  class="text-[clamp(0.6rem,0.5rem+0.3vw,0.75rem)] px-1.5 py-0.5 bg-bone-200 dark:bg-ink-200 rounded font-normal italic lowercase"
                >
                  {{ t().shared }}
                </span>
              }

              ·

              <span class="font-display font-normal italic">
                {{ wishlistItem().addedAt | date: 'd MMM' }}
              </span>
            </span>
          }
        </div>

        <!-- ACTIONS -->

        <div class="flex gap-1 shrink-0">
          @if (isWishlist()) {
            @if (wishlistStatus() === 'pending') {
              <button appBtn variant="action" (click)="markDownloaded($event)">
                <app-icon name="check" class="search-result-wishlist-action-icon" />
              </button>

              <button
                appBtn
                variant="action"
                [danger]="true"
                (click)="removeWishlistItem($event)"
              >
                <app-icon name="close" class="search-result-wishlist-action-icon" />
              </button>
            } @else {
              <button
                appBtn
                variant="action"
                (click)="unmarkDownloaded($event)"
              >
                <app-icon name="chevron-left" class="search-result-wishlist-action-icon" />
              </button>

              <button
                appBtn
                variant="action"
                [danger]="true"
                (click)="removeWishlistItem($event)"
              >
                <app-icon name="trash" class="search-result-wishlist-action-icon" />
              </button>
            }
          } @else if (showAddButton()) {
            <button
              appBtn
              variant="add"
              [added]="isAdded()"
              (click)="onAdd(trackItem(), $event)"
            >
              <app-icon [name]="addButtonIcon()" class="search-result-action-icon" />
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class SearchResultItemComponent {
  private preview = inject(PreviewService);
  private search = inject(SearchService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  item = input.required<Track | WishlistEntryExtended | ReleaseItem>();

  source = input<'search' | 'wishlist' | 'releases'>('search');

  type = input<SearchItemType>('track');

  isAdded = input(false);
  showAddButton = input(true);
  showTypeChip = input(true);
  showTrackNumber = input(false);

  wishlistStatus = input<'pending' | 'downloaded'>('pending');

  onArtistClick = output<Track>();
  onAlbumClick = output<string>();
  onAddClick = output<Track>();
  onPlayClick = output<Track>();

  onMarkDownloaded = output<WishlistEntry>();
  onUnmarkDownloaded = output<WishlistEntry>();
  onRemove = output<WishlistEntry>();

  t = computed(() => this.languageService.t());

  previewState = computed(() => this.preview.state());

  trackItem = computed(() => this.item() as Track);

  wishlistItem = computed(() => this.item() as WishlistEntryExtended);

  releaseItem = computed(() => this.item() as ReleaseItem);

  formatFans = formatFans;

  readonly isWishlist = computed(() => this.source() === 'wishlist');

  readonly isArtist = computed(() => this.type() === 'artist');

  readonly accent = computed(() => {
    const itemType = this.isWishlist() ? this.wishlistItem().type : this.type();

    const map: Record<string, string> = {
      artist: 'track',
      track: 'track',
      album: 'album',
      ep: 'ep',
      single: 'track',
    };

    return map[itemType] ?? 'track';
  });

  title = computed(() => {
    return this.isWishlist() ? this.wishlistItem().name : this.trackItem().name;
  });

  subtitle = computed(() => {
    return this.isWishlist()
      ? this.wishlistItem().artist
      : this.trackItem().artists?.[0];
  });

  coverUrl = computed(() => {
    return this.isWishlist()
      ? this.wishlistItem().coverUrl
      : this.trackItem().coverUrl;
  });

  itemType = computed(() => {
    return this.isWishlist() ? this.wishlistItem().type : this.trackItem().type;
  });

  hasPreview = computed(() => {
    if (this.isWishlist()) {
      return this.wishlistItem().type === 'track';
    }

    return !!this.trackItem().previewUrl;
  });

  coverSize = computed(() => {
    return this.isWishlist() ? 64 : 56;
  });

  addButtonIcon = computed(() => {
    return this.isAdded() ? 'check' : 'plus';
  });

  isPreviewing = computed(() => {
    if (this.isWishlist()) {
      return this.previewState().trackId === this.wishlistItem().trackId;
    }

    return this.previewState().trackId === this.trackItem().id;
  });

  accentClasses(): string[] {
    const accent = this.accent();

    return [
      `group-hover:text-accent-${accent}`,
      `dark:group-hover:text-accent-dark-${accent}`,
      'group-hover:opacity-80',
      ...(this.isPreviewing()
        ? [`!text-accent-${accent}`, `dark:!text-accent-dark-${accent}`]
        : []),
    ];
  }

  handleItemClick(): void {
    if (this.isWishlist()) {
      this.onWishlistItemClick();
      return;
    }

    switch (this.type()) {
      case 'track':
        this.onPlayPreviewClick(this.trackItem());
        break;

      case 'album':
      case 'ep':
      case 'single':
        this.onAlbumClick.emit(this.trackItem().id);
        break;
    }
  }

  onAdd(track: Track, event: Event): void {
    event.stopPropagation();
    this.onAddClick.emit(track);
  }

  onPlayPreviewClick(track: Track): void {
    this.onPlayClick.emit(track);
    this.onPlayPreview(track);
  }

  onPlayPreview(track: Track): void {
    if (!track.previewUrl) return;

    this.preview.play({
      id: track.id,
      title: track.name,
      artist: track.artists?.[0] ?? '',
      cover: track.coverUrl,
      previewUrl: track.previewUrl,
    });
  }

  onWishlistItemClick(): void {
    const item = this.wishlistItem();

    if (item.type === 'track') {
      this.onPlayPreviewWishlist(item);
      return;
    }

    if (this.isAlbumType(item.type)) {
      this.goToAlbum(item.trackId);
    }
  }

  async onPlayPreviewWishlist(entry: WishlistEntry): Promise<void> {
    const previewUrl = await this.search
      .getTrackPreview(entry.trackId)
      .toPromise();

    if (!previewUrl) return;

    this.preview.play({
      id: entry.trackId,
      title: entry.name,
      artist: entry.artist,
      cover: entry.coverUrl,
      previewUrl,
    });
  }

  markDownloaded(event: Event): void {
    event.stopPropagation();
    this.onMarkDownloaded.emit(this.wishlistItem());
  }

  unmarkDownloaded(event: Event): void {
    event.stopPropagation();
    this.onUnmarkDownloaded.emit(this.wishlistItem());
  }

  removeWishlistItem(event: Event): void {
    event.stopPropagation();
    this.onRemove.emit(this.wishlistItem());
  }

  isShared(): boolean {
    return this.wishlistItem().isOwner === false;
  }

  isAlbumType(type: string): boolean {
    return ['album', 'ep', 'single'].includes(type);
  }

  goToAlbum(albumId: string): void {
    this.router.navigate(['/album', albumId]);
  }
}
