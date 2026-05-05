import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../core/api/search.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { FavoriteArtistsService } from '../../core/firebase/favorite-artists.service';
import { AuthService } from '../../core/auth/auth.service';
import { PreviewService } from '../../core/services/preview.service';
import { Track } from '../../shared/models/track.model';
import { CoverComponent } from '../../shared/components/cover/cover.component';
import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { formatFans } from '../../shared/utils/format-fans';
import { LanguageService } from '../../core/i18n/language.service';

@Component({
  selector: 'app-artist',
  standalone: true,
  imports: [
    CommonModule,
    CoverComponent,
    SearchResultItemComponent,
    SpinnerComponent,
    IconComponent,
  ],
  styles: `
    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: scale(1);
      }
    }
    .btn-pop-in {
      animation: popIn 220ms var(--ease-smooth) both;
    }
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
      <div class="flex items-center justify-between gap-2">
        <button
          class="bg-transparent text-ink-700 dark:text-bone-700 text-md cursor-pointer transition-colors duration-fast hover:text-ink dark:hover:text-bone lowercase"
          (click)="goBack()"
          [aria-label]="t().back"
        >
          ← {{ t().back }}
        </button>
        <span
          class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink dark:text-bone font-bold tracking-[0.06em] uppercase"
        >
          <span
            class="text-ink-700 dark:text-bone-700 font-normal italic lowercase"
            >02.a/</span
          >
          {{ t().artist }}
        </span>
      </div>

      <div class="scroll-fade flex flex-col p-4 py-2 gap-8">
        <div
          class="flex gap-2 max-md:flex-col max-md:items-center md:gap-8 max-md:text-center mt-4"
        >
          <div
            class="shrink-0 w-[200px] h-[200px] rounded-md overflow-hidden max-md:w-[150px] max-md:h-[150px]"
          >
            @if (artist(); as a) {
              <app-cover
                [name]="a.name"
                [coverUrl]="a.picture_big"
                [size]="200"
              />
            }
          </div>

          <div class="flex-1 flex flex-col justify-start">
            @if (artist(); as a) {
              <div class="flex flex-col text-ink dark:text-bone">
                <div class="flex items-center gap-4 mb-5">
                  <h1
                    class="m-0 text-[clamp(2rem,1.166rem+3.2389vw,4rem)] font-bold font-display flex-1"
                  >
                    {{ a.name }}
                  </h1>
                  <button
                    class="[&.active]:btn-pop-in w-9 h-9 md:w-12 md:h-12 rounded-full cursor-pointer flex items-center justify-center text-ink-600 dark:text-bone-600 shrink-0 bg-transparent p-0 transition-[color,transform] duration-fast ease-smooth hover:scale-[1.05] active:scale-[0.88]"
                    [class.active]="isArtistInWishlist(a.id)"
                    (click)="toggleArtist($event)"
                    [title]="
                      isArtistInWishlist(a.id)
                        ? 'Quitar de wishlist'
                        : 'Añadir a wishlist'
                    "
                  >
                    @if (isArtistInWishlist(a.id)) {
                      <app-icon
                        name="heart-filled"
                        class="w-8 h-8 md:w-12 md:h-12"
                      />
                    } @else {
                      <app-icon name="heart" class="w-8 h-8 md:w-12 md:h-12" />
                    }
                  </button>
                </div>

                <div class="flex gap-[30px] mb-5 max-md:justify-center">
                  @if (a.nb_fan !== undefined) {
                    <div class="flex flex-col gap-1">
                      <span
                        class="font-display italic text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink-700 dark:text-bone-700 uppercase tracking-[0.5px]"
                        >{{ t().followers }}</span
                      >
                      <span
                        class="text-[clamp(1.125rem,1.0207rem+0.4049vw,1.375rem)] font-bold"
                        >{{ formatFans(a.nb_fan) }}</span
                      >
                    </div>
                  }
                  @if (a.nb_album !== undefined) {
                    <div class="flex flex-col gap-1">
                      <span
                        class="font-display italic text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink-700 dark:text-bone-700 uppercase tracking-[0.5px]"
                        >{{ t().albums2 }}</span
                      >
                      <span
                        class="text-[clamp(1.125rem,1.0207rem+0.4049vw,1.375rem)] font-bold"
                        >{{ a.nb_album }}</span
                      >
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h2
            class="font-body text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink-700 dark:text-bone-700 font-semibold tracking-[0.05em] uppercase m-0"
          >
            {{ t().popularSongs }}
          </h2>

          @if (loading()) {
            <div
              class="flex flex-col items-center gap-4 py-10 px-5 text-ink-600 dark:text-bone-600 text-center [animation:fadeIn_300ms_var(--ease)_both]"
            >
              <app-spinner size="md" />
              <span
                class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] italic"
                >{{ t().loadingSongs }}</span
              >
            </div>
          } @else if (tracks().length === 0) {
            <div
              class="text-center py-10 px-5 text-ink-700 dark:text-bone-700 text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] [animation:fadeIn_300ms_var(--ease)_both]"
            >
              {{ t().noSongsAvailable }}
            </div>
          } @else {
            <div
              class="flex flex-col [&>*]:[animation:rowEnter_var(--dur-base)_var(--ease)_both]"
            >
              @for (track of tracks(); track track.id) {
                <app-search-result-item
                  [item]="track"
                  type="track"
                  [isAdded]="isInWishlist(track.id)"
                  [showAddButton]="true"
                  [showTypeChip]="false"
                  (onAddClick)="toggle($event)"
                  (onPlayClick)="onTrackPlayClicked($event)"
                />
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ArtistComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchSvc = inject(SearchService);
  private wishlistSvc = inject(WishlistService);
  private favoriteArtistsSvc = inject(FavoriteArtistsService);
  private authSvc = inject(AuthService);
  private previewSvc = inject(PreviewService);
  private languageService = inject(LanguageService);

  t = computed(() => this.languageService.t());

  artist = signal<any>(null);
  tracks = signal<Track[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const artistId = params.get('id');
      if (artistId) {
        this.loadArtist(artistId);
      }
    });
  }

  private loadArtist(artistId: string) {
    this.loading.set(true);

    this.searchSvc.getArtist(artistId).subscribe((artist) => {
      this.artist.set(artist);
    });

    this.searchSvc.getArtistTracks(artistId).subscribe((tracks) => {
      this.tracks.set(tracks);
      this.loading.set(false);
    });
  }

  isInWishlist(trackId: string): boolean {
    return this.wishlistSvc.entries().some((e) => e.trackId === trackId);
  }

  isArtistInWishlist(artistId: string | number): boolean {
    return this.favoriteArtistsSvc.artistIds().has(String(artistId));
  }

  async toggle(track: Track) {
    const entries = this.wishlistSvc.entries();
    const existing = entries.find((e) => e.trackId === track.id);

    if (existing && existing.id) {
      await this.wishlistSvc.remove(existing.id);
    } else {
      const user = this.authSvc.currentUser();
      if (user) {
        await this.wishlistSvc.add(track, user);
      }
    }
  }

  async toggleArtist(e: Event) {
    e.stopPropagation();
    const currentArtist = this.artist();
    const user = this.authSvc.currentUser();
    if (!currentArtist || !user) return;

    const artistId = String(currentArtist.id);
    const existing = this.favoriteArtistsSvc
      .artists()
      .find((a) => a.artistId === artistId);

    if (existing && existing.id) {
      await this.favoriteArtistsSvc.remove(existing.id);
    } else {
      await this.favoriteArtistsSvc.add(
        artistId,
        currentArtist.name,
        currentArtist.picture_big,
        user,
      );
    }
  }

  onTrackPlayClicked(track: Track) {
    const playlist = this.tracks()
      .filter((t) => t.previewUrl)
      .map((t) => ({
        id: t.id,
        title: t.name,
        artist: t.artists?.[0] ?? '',
        cover: t.coverUrl,
        previewUrl: t.previewUrl!,
      }));

    const idx = playlist.findIndex((p) => p.id === track.id);
  }

  goBack() {
    this.router.navigate(['']);
  }

  formatFans = formatFans;
}
