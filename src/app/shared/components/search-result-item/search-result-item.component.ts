import { Component, computed, input, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { fadeInOut } from '../../animations/animations';
import { Track } from '../../models/track.model';
import { WishlistEntry } from '../../models/wishlist-entry.model';
import { ReleaseItem } from '../../models/release-item.model';
import { CoverComponent } from '../cover/cover.component';
import { TypeChipComponent } from '../type-chip/type-chip.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { PreviewService } from '../../../core/services/preview.service';
import { PreviewSpinnerComponent } from '../preview-spinner/preview-spinner.component';
import { IconComponent } from '../../icons/icon.component';
import { ButtonComponent } from '../button/button.component';
import { formatFans } from '../../utils/format-fans';

@Component({
  selector: 'app-search-result-item',
  standalone: true,
  animations: [fadeInOut()],
  imports: [
    DatePipe,
    CoverComponent,
    TypeChipComponent,
    AvatarComponent,
    PreviewSpinnerComponent,
    IconComponent,
    ButtonComponent,
  ],
  template: `
    @if (source() === 'search') {
      @switch (type()) {
        @case ('artist') {
          <div
            class="flex items-center gap-3 py-2.5 border-b border-ink-200 transition-[background] duration-fast ease-smooth"
          >
            <button
              class="bg-transparent border-none cursor-pointer text-left flex-1 flex items-center gap-3 rounded-md transition-[background] duration-fast ease-smooth hover:bg-ink-100 p-0"
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
                  class="font-display text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] font-semibold text-bone-100 leading-none whitespace-nowrap overflow-hidden text-ellipsis h-[clamp(1.125rem,0.9686rem+0.6073vw,1.5rem)]"
                >
                  {{ trackItem().name }}
                </span>
                <div class="flex items-baseline gap-2 text-bone-800">
                  @if (trackItem().fanCount) {
                    <span
                      class="text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-bone-700"
                    >
                      <b>{{ formatFans(trackItem().fanCount ?? 0) }}</b>
                      fan{{ trackItem().fanCount !== 1 ? 's' : '' }}
                    </span>
                    <span class="text-bone-800">·</span>
                  }
                  @if (trackItem().albumCount) {
                    <span
                      class="font-display italic text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-bone-700"
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
                [title]="isAdded() ? 'Quitar de wishlist' : 'Añadir a wishlist'"
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
            class="flex items-center gap-3 py-2.5 border-b border-ink-200 transition-[background] duration-fast ease-smooth"
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
              @if (
                previewState().trackId === trackItem().id &&
                (previewState().isPlaying || previewState().isLoading)
              ) {
                <div
                  class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-sm backdrop-blur-[1.5px]"
                  @fadeInOut
                >
                  <app-preview-spinner
                    [progress]="previewState().progress"
                    [isPlaying]="previewState().isPlaying"
                    [isLoading]="previewState().isLoading"
                  />
                </div>
              }
            </button>
            <div class="flex-1 flex flex-col gap-[3px] min-w-0">
              <span
                class="font-display text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] font-semibold text-bone-100 leading-none whitespace-nowrap overflow-hidden text-ellipsis h-[clamp(1.125rem,0.9686rem+0.6073vw,1.5rem)]"
              >
                {{ trackItem().name }}
              </span>
              <div class="flex items-baseline gap-2 text-bone-800">
                <span
                  class="text-[clamp(0.8125rem,0.6822rem+0.5061vw,1.125rem)] text-bone-600 whitespace-nowrap overflow-hidden text-ellipsis"
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
                [title]="isAdded() ? 'Quitar de wishlist' : 'Añadir a wishlist'"
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
      }
    } @else {
      <div
        class="flex items-center gap-3 py-3 px-2 -mx-2 border-b border-ink-200 transition-[background] duration-fast ease-smooth [animation:rowEnter_var(--dur-base)_var(--ease)_both]"
      >
        @if (wishlistItem().type === 'track' && wishlistItem().previewUrl) {
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
            @if (
              previewState().trackId === wishlistItem().trackId &&
              (previewState().isPlaying || previewState().isLoading)
            ) {
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-sm backdrop-blur-[1.5px]"
                @fadeInOut
              >
                <app-preview-spinner
                  [progress]="previewState().progress"
                  [isPlaying]="previewState().isPlaying"
                  [isLoading]="previewState().isLoading"
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

        <div class="flex-1 flex flex-col gap-[3px] min-w-0">
          <span
            class="font-display text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] font-semibold text-bone-100 leading-none whitespace-nowrap overflow-hidden text-ellipsis h-[clamp(1.125rem,0.9686rem+0.6073vw,1.5rem)]"
          >
            {{ wishlistItem().name }}
          </span>
          <span class="flex items-baseline gap-2 text-bone-800">
            <span
              class="text-[clamp(0.8125rem,0.6822rem+0.5061vw,1.125rem)] text-bone-600 whitespace-nowrap overflow-hidden text-ellipsis h-[clamp(0.9375rem,0.8072rem+0.5061vw,1.25rem)]"
            >
              {{ wishlistItem().artist }}
            </span>
            ·
            <app-type-chip [type]="wishlistItem().type" />
          </span>
          <span
            class="text-[clamp(0.6875rem,0.6093rem+0.3036vw,0.875rem)] text-bone-800 flex items-center gap-1 flex-wrap font-semibold"
          >
            <app-avatar [name]="wishlistItem().addedBy" [size]="14" />
            {{ wishlistItem().addedBy }}
            @if (isShared()) {
              <span
                class="text-[clamp(0.6rem,0.5rem+0.3vw,0.75rem)] px-1.5 py-0.5 bg-ink-200 rounded text-bone-700 font-normal"
                >Compartida</span
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
                class="w-[clamp(1rem,2.5vw,1.25rem)] h-[clamp(1rem,2.5vw,1.25rem)]"
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
                class="w-[clamp(1rem,2.5vw,1.25rem)] h-[clamp(1rem,2.5vw,1.25rem)]"
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
                class="w-[clamp(1rem,2.5vw,1.25rem)] h-[clamp(1rem,2.5vw,1.25rem)]"
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
                class="w-[clamp(1rem,2.5vw,1.25rem)] h-[clamp(1rem,2.5vw,1.25rem)]"
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

  formatFans = formatFans;

  onPlayPreview(track: Track): void {
    if (!track.previewUrl) return;
    this.preview.play(track.id, track.previewUrl);
  }

  onPlayPreviewWishlist(entry: WishlistEntry): void {
    if (!entry.previewUrl) return;
    this.preview.play(entry.trackId, entry.previewUrl);
  }

  isShared(): boolean {
    const entry = this.wishlistItem() as any;
    return entry?.isOwner === false;
  }
}
