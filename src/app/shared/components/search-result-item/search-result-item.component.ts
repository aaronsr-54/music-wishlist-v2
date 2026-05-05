import { Component, computed, input, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { fadeInOut } from '../../animations/animations';
import { Track } from '../../models/track.model';
import { WishlistEntry } from '../../models/wishlist-entry.model';
import { ReleaseItem } from '../../models/release-item.model';
import { CoverComponent } from '../cover/cover.component';
import { TypeChipComponent } from '../type-chip/type-chip.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { PreviewService } from '../../../core/services/preview.service';
import { SearchService } from '../../../core/api/search.service';

import { IconComponent } from '../../icons/icon.component';
import { ButtonComponent } from '../button/button.component';
import { formatFans } from '../../utils/format-fans';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-search-result-item',
  standalone: true,
  animations: [fadeInOut()],
  imports: [
    DatePipe,
    CoverComponent,
    TypeChipComponent,
    AvatarComponent,
    
    IconComponent,
    ButtonComponent,
  ],
  template: `
    @if (source() === 'search') {
      @switch (type()) {
        @case ('artist') {
          <div
            class="flex items-center gap-3 py-2.5 border-b border-bone-200 dark:border-ink-200 transition-[background] duration-fast ease-smooth"
          >
            <button
              class="bg-transparent border-none cursor-pointer text-left flex-1 flex items-center gap-3 rounded-md transition-[background] duration-fast ease-smooth hover:bg-bone-100 dark:hover:bg-ink-100 p-0"
              (click)="onArtistClick.emit(trackItem())"
              [title]="trackItem().name"
            >
              <app-cover
                [coverUrl]="trackItem().coverUrl"
                [name]="trackItem().name"
                [size]="56"
              />
              <div class="flex-1 flex flex-col gap-[3px] min-w-0">
                <span
                  class="font-display text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] font-semibold text-ink-100 dark:text-bone-100 leading-none whitespace-nowrap overflow-hidden text-ellipsis h-[clamp(1.125rem,0.9686rem+0.6073vw,1.5rem)]"
                >
                  {{ trackItem().name }}
                </span>
                <div
                  class="flex items-baseline gap-2 leading-none text-ink-800 dark:text-bone-800"
                >
                  @if (trackItem().fanCount) {
                    <span
                      class="text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink-700 dark:text-bone-700"
                    >
                      <b>{{ formatFans(trackItem().fanCount ?? 0) }}</b>
                      fan{{ trackItem().fanCount !== 1 ? 's' : '' }}
                    </span>
                    <span class="text-ink-800 dark:text-bone-800">·</span>
                  }
                  @if (trackItem().albumCount) {
                    <span
                      class="font-display italic text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink-700 dark:text-bone-700"
                    >
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
                (click)="onAddClick.emit(trackItem())"
                [title]="isAdded() ? t().removeFromWishlist : t().addToWishlist"
              >
                @if (isAdded()) {
                  <app-icon
                    name="heart-filled"
                    class="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)]"
                  />
                } @else {
                  <app-icon
                    name="heart"
                    class="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)]"
                  />
                }
              </button>
            }
          </div>
        }
        @case ('track') {
          <div
            class="flex items-center gap-3 py-2.5 border-b border-bone-200 dark:border-ink-200 transition-[background] duration-fast ease-smooth"
          >
            <button
              class="relative border-none bg-transparent p-0 cursor-pointer shrink-0 rounded-md transition-opacity duration-fast ease-smooth disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:opacity-80"
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
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-sm backdrop-blur-[1.5px]"
                  @fadeInOut
                >
                </div>
              }
            </button>
            <div class="flex-1 flex flex-col gap-[3px] min-w-0">
              <span
                class="font-display text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] font-semibold text-ink-100 dark:text-bone-100 leading-none whitespace-nowrap overflow-hidden text-ellipsis h-[clamp(1.125rem,0.9686rem+0.6073vw,1.5rem)]"
              >
                {{ trackItem().name }}
              </span>
              <div
                class="flex items-baseline gap-2 leading-none text-ink-800 dark:text-bone-800"
              >
                <span
                  class="text-[clamp(0.8125rem,0.6822rem+0.5061vw,1.125rem)] text-ink-600 dark:text-bone-600 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {{ trackItem().artists[0] }}
                </span>
                ·
                <app-type-chip [type]="trackItem().type" />
              </div>
            </div>
            @if (showAddButton()) {
              <button
                appBtn
                variant="add"
                [added]="isAdded()"
                (click)="onAddClick.emit(trackItem())"
                [title]="isAdded() ? t().removeFromWishlist : t().addToWishlist"
              >
                @if (isAdded()) {
                  <app-icon
                    name="check"
                    class="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)]"
                  />
                } @else {
                  <app-icon
                    name="plus"
                    class="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)]"
                  />
                }
              </button>
            }
          </div>
        }
        @case ('album') {
          <div
            class="flex items-center gap-3 py-2.5 border-b border-bone-200 dark:border-ink-200 transition-[background] duration-fast ease-smooth rounded-md -mx-2 px-2 cursor-pointer"
            (click)="onAlbumClick.emit(trackItem().id)"
          >
            <div class="shrink-0 rounded-md">
              <app-cover [coverUrl]="trackItem().coverUrl" [name]="trackItem().name" [size]="56" />
            </div>
            <div class="flex-1 flex flex-col gap-[3px] min-w-0">
              <span class="font-display text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] font-semibold text-ink-100 dark:text-bone-100 leading-none whitespace-nowrap overflow-hidden text-ellipsis h-[clamp(1.125rem,0.9686rem+0.6073vw,1.5rem)]">
                {{ trackItem().name }}
              </span>
              <div class="flex items-baseline gap-2 leading-none text-ink-800 dark:text-bone-800">
                <span class="text-[clamp(0.8125rem,0.6822rem+0.5061vw,1.125rem)] text-ink-600 dark:text-bone-600 whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ trackItem().artists[0] }}
                </span>
                · <app-type-chip [type]="trackItem().type" />
              </div>
            </div>
            @if (showAddButton()) {
              <button appBtn variant="add" [added]="isAdded()" (click)="onAddClick.emit(trackItem()); $event.stopPropagation()" [title]="isAdded() ? t().removeFromWishlist : t().addToWishlist">
                <app-icon [name]="isAdded() ? 'check' : 'plus'" class="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)]" />
              </button>
            }
          </div>
        }
        @case ('ep') {
          <div
            class="flex items-center gap-3 py-2.5 border-b border-bone-200 dark:border-ink-200 transition-[background] duration-fast ease-smooth rounded-md -mx-2 px-2 cursor-pointer"
            (click)="onAlbumClick.emit(trackItem().id)"
          >
            <div class="shrink-0 rounded-md">
              <app-cover [coverUrl]="trackItem().coverUrl" [name]="trackItem().name" [size]="56" />
            </div>
            <div class="flex-1 flex flex-col gap-[3px] min-w-0">
              <span class="font-display text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] font-semibold text-ink-100 dark:text-bone-100 leading-none whitespace-nowrap overflow-hidden text-ellipsis h-[clamp(1.125rem,0.9686rem+0.6073vw,1.5rem)]">
                {{ trackItem().name }}
              </span>
              <div class="flex items-baseline gap-2 leading-none text-ink-800 dark:text-bone-800">
                <span class="text-[clamp(0.8125rem,0.6822rem+0.5061vw,1.125rem)] text-ink-600 dark:text-bone-600 whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ trackItem().artists[0] }}
                </span>
                · <app-type-chip [type]="trackItem().type" />
              </div>
            </div>
            @if (showAddButton()) {
              <button appBtn variant="add" [added]="isAdded()" (click)="onAddClick.emit(trackItem()); $event.stopPropagation()" [title]="isAdded() ? t().removeFromWishlist : t().addToWishlist">
                <app-icon [name]="isAdded() ? 'check' : 'plus'" class="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)]" />
              </button>
            }
          </div>
        }
        @case ('single') {
          <div
            class="flex items-center gap-3 py-2.5 border-b border-bone-200 dark:border-ink-200 transition-[background] duration-fast ease-smooth rounded-md -mx-2 px-2 cursor-pointer"
            (click)="onAlbumClick.emit(trackItem().id)"
          >
            <div class="shrink-0 rounded-md">
              <app-cover [coverUrl]="trackItem().coverUrl" [name]="trackItem().name" [size]="56" />
            </div>
            <div class="flex-1 flex flex-col gap-[3px] min-w-0">
              <span class="font-display text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] font-semibold text-ink-100 dark:text-bone-100 leading-none whitespace-nowrap overflow-hidden text-ellipsis h-[clamp(1.125rem,0.9686rem+0.6073vw,1.5rem)]">
                {{ trackItem().name }}
              </span>
              <div class="flex items-baseline gap-2 leading-none text-ink-800 dark:text-bone-800">
                <span class="text-[clamp(0.8125rem,0.6822rem+0.5061vw,1.125rem)] text-ink-600 dark:text-bone-600 whitespace-nowrap overflow-hidden text-ellipsis">
                  {{ trackItem().artists[0] }}
                </span>
                · <app-type-chip [type]="trackItem().type" />
              </div>
            </div>
            @if (showAddButton()) {
              <button appBtn variant="add" [added]="isAdded()" (click)="onAddClick.emit(trackItem()); $event.stopPropagation()" [title]="isAdded() ? t().removeFromWishlist : t().addToWishlist">
                <app-icon [name]="isAdded() ? 'check' : 'plus'" class="w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)]" />
              </button>
            }
          </div>
        }
      }
    } @else {
      <div
        class="flex items-center gap-3 py-3 px-2 border-b border-bone-200 dark:border-ink-200 transition-[background] duration-fast ease-smooth [animation:rowEnter_var(--dur-base)_var(--ease)_both]"
      >
        @if (wishlistItem().type === 'track') {
          <button
            class="relative border-none bg-transparent p-0 cursor-pointer shrink-0 rounded-md transition-opacity duration-fast ease-smooth enabled:hover:opacity-80"
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
            @if (previewState().trackId === wishlistItem().trackId) {
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-sm backdrop-blur-[1.5px]"
                @fadeInOut
              >
              </div>
            }
          </button>
        } @else {
          @if (isAlbumType(wishlistItem().type)) {
            <button
              class="border-none bg-transparent p-0 cursor-pointer shrink-0 rounded-md transition-opacity duration-fast ease-smooth enabled:hover:opacity-80"
              (click)="goToAlbum(wishlistItem().trackId)"
              [title]="wishlistItem().name"
            >
              <app-cover
                [coverUrl]="wishlistItem().coverUrl"
                [name]="wishlistItem().name"
                [size]="64"
              />
            </button>
          } @else {
            <app-cover
              [coverUrl]="wishlistItem().coverUrl"
              [name]="wishlistItem().name"
              [size]="64"
            />
          }
        }

        <div class="flex-1 flex flex-col gap-2 min-w-0">
          <button
            class="flex-1 flex flex-col text-left bg-transparent border-none p-0 cursor-pointer rounded-md transition-[background] duration-fast hover:bg-bone-100 dark:hover:bg-ink-100 -mx-2 px-2"
            (click)="isAlbumType(wishlistItem().type) ? goToAlbum(wishlistItem().trackId) : null"
          >
            <span
              class="font-display text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] font-semibold text-ink dark:text-bone leading-none whitespace-nowrap overflow-hidden text-ellipsis h-[clamp(1.125rem,0.9686rem+0.6073vw,1.5rem)]"
            >
              {{ wishlistItem().name }}
            </span>
            <span
              class="flex items-center gap-2 leading-none text-ink-800 dark:text-bone-800"
            >
              <span
                class="text-[clamp(0.8125rem,0.6822rem+0.5061vw,1.125rem)] text-ink-700 dark:text-bone-700 whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {{ wishlistItem().artist }} </span
              >·
              <app-type-chip [type]="wishlistItem().type" />
            </span>
          </button>
          <span
            class="text-[clamp(0.6875rem,0.6093rem+0.3036vw,0.875rem)] text-ink-200 dark:text-bone-800 flex items-center gap-1 flex-wrap font-semibold"
          >
            <app-avatar [name]="wishlistItem().addedBy" [size]="14" />
            {{ isShared() ? wishlistItem().addedBy : 'Yo' }}
            @if (isShared()) {
              ·
              <span
                class="text-[clamp(0.6rem,0.5rem+0.3vw,0.75rem)] px-1.5 py-0.5 bg-bone-200 dark:bg-ink-200 rounded font-normal italic lowercase"
                >{{ t().shared }}</span
              >
            }
            ·
            <span class="font-display font-normal italic">{{
              wishlistItem().addedAt | date: 'd MMM'
            }}</span>
          </span>
        </div>

        <div class="flex gap-1 shrink-0">
          @if (wishlistStatus() === 'pending') {
            <button
              appBtn
              variant="action"
              (click)="onMarkDownloaded.emit(wishlistItem())"
              title="Marcar como listo"
            >
              <app-icon
                name="check"
                class="w-[clamp(1rem,2.5vw,1.25rem)] h-[clamp(1rem,2.5vw,1.25rem)] text-ink dark:text-bone"
              />
            </button>
            <button
              appBtn
              variant="action"
              [danger]="true"
              (click)="onRemove.emit(wishlistItem())"
              title="Eliminar"
            >
              <app-icon
                name="close"
                class="w-[clamp(1rem,2.5vw,1.25rem)] h-[clamp(1rem,2.5vw,1.25rem)] text-ink dark:text-bone"
              />
            </button>
          } @else {
            <button
              appBtn
              variant="action"
              (click)="onUnmarkDownloaded.emit(wishlistItem())"
              title="Mover a pendientes"
            >
              <app-icon
                name="chevron-left"
                class="w-[clamp(1rem,2.5vw,1.25rem)] h-[clamp(1rem,2.5vw,1.25rem)] text-ink dark:text-bone"
              />
            </button>
            <button
              appBtn
              variant="action"
              [danger]="true"
              (click)="onRemove.emit(wishlistItem())"
              title="Eliminar"
            >
              <app-icon
                name="trash"
                class="w-[clamp(1rem,2.5vw,1.25rem)] h-[clamp(1rem,2.5vw,1.25rem)] text-ink dark:text-bone"
              />
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

  item = input.required<Track | WishlistEntry | ReleaseItem>();
  source = input<'search' | 'wishlist' | 'releases'>('search');
  type = input<'artist' | 'track' | 'album' | 'ep' | 'single'>('track');
  isAdded = input(false);
  showAddButton = input(true);
  showTypeChip = input(true);
  wishlistStatus = input<'pending' | 'downloaded'>('pending');

  onArtistClick = output<Track>();
  onAlbumClick = output<string>();
  onAddClick = output<Track>();
  onMarkDownloaded = output<WishlistEntry>();
  onUnmarkDownloaded = output<WishlistEntry>();
  onRemove = output<WishlistEntry>();

  t = computed(() => this.languageService.t());
  trackItem = computed(() => this.item() as Track);
  wishlistItem = computed(() => this.item() as WishlistEntry);
  releaseItem = computed(() => this.item() as ReleaseItem);
  previewState = computed(() => this.preview.state());

  formatFans = formatFans;

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

  async onPlayPreviewWishlist(entry: WishlistEntry): Promise<void> {
    const previewUrl = await this.search.getTrackPreview(entry.trackId).toPromise();
    if (!previewUrl) return;
    this.preview.play({
      id: entry.trackId,
      title: entry.name,
      artist: entry.artist,
      cover: entry.coverUrl,
      previewUrl,
    });
  }

  isShared(): boolean {
    const entry = this.wishlistItem() as any;
    return entry?.isOwner === false;
  }

  isAlbumType(type: string): boolean {
    return type === 'album' || type === 'ep' || type === 'single';
  }

  goToAlbum(albumId: string) {
    this.router.navigate(['/album', albumId]);
  }
}
