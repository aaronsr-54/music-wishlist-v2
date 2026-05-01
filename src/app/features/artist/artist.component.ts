import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../core/api/search.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { FavoriteArtistsService } from '../../core/firebase/favorite-artists.service';
import { AuthService } from '../../core/auth/auth.service';
import { Track } from '../../shared/models/track.model';
import { CoverComponent } from '../../shared/components/cover/cover.component';
import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { formatFans } from '../../shared/utils/format-fans';

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
  template: `
    <div class="panel pt-2">
      <div class="eyebrow">
        <button
          class="bg-transparent border-none text-bone-700 text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] cursor-pointer transition-colors duration-fast ease-smooth hover:text-bone"
          (click)="goBack()"
          aria-label="Volver"
        >
          ← Volver
        </button>
        <span class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-bone font-bold tracking-[0.06em]">
          <span class="text-bone-700 font-normal italic">02.a/</span> ARTISTA
        </span>
      </div>

      <div
        class="flex flex-col h-full px-4 gap-16 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_10px,black_80%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10px,black_80%,transparent_100%)]"
      >
        <div class="flex gap-[30px] max-md:flex-col max-md:items-center max-md:gap-5 max-md:text-center">
          <div class="shrink-0 w-[200px] h-[200px] rounded-md overflow-hidden max-md:w-[150px] max-md:h-[150px]">
            @if (artist(); as a) {
              <app-cover [name]="a.name" [coverUrl]="a.picture_big" [size]="200" />
            }
          </div>

          <div class="flex-1 flex flex-col justify-start">
            @if (artist(); as a) {
              <div class="flex flex-col">
                <div class="flex items-center gap-4 mb-5">
                  <h1 class="m-0 text-[clamp(2rem,1.166rem+3.2389vw,4rem)] font-bold font-display flex-1">
                    {{ a.name }}
                  </h1>
                  <button
                    class="w-9 h-9 md:w-12 md:h-12 rounded-full cursor-pointer flex items-center justify-center text-bone-600 shrink-0 border-[1.5px] border-ink-200 bg-transparent p-0 transition-[background,border-color,color,transform] duration-fast ease-smooth hover:border-bone-600 hover:bg-ink-100 hover:text-bone-100 active:scale-[0.88]"
                    [class.!bg-bone]="isArtistInWishlist(a.id)"
                    [class.!border-bone]="isArtistInWishlist(a.id)"
                    [class.!text-ink]="isArtistInWishlist(a.id)"
                    [class.btn-pop-in]="isArtistInWishlist(a.id)"
                    (click)="toggleArtist($event)"
                    [title]="isArtistInWishlist(a.id) ? 'Quitar de wishlist' : 'Añadir a wishlist'"
                  >
                    @if (isArtistInWishlist(a.id)) {
                      <app-icon name="heart-filled" class="w-5 h-5 md:w-8 md:h-8" />
                    } @else {
                      <app-icon name="heart" class="w-5 h-5 md:w-8 md:h-8" />
                    }
                  </button>
                </div>

                <div class="flex gap-[30px] mb-5 max-md:justify-center">
                  @if (a.nb_fan !== undefined) {
                    <div class="flex flex-col gap-1">
                      <span class="font-display italic text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-bone-700 uppercase tracking-[0.5px]">Seguidores</span>
                      <span class="text-[clamp(1.125rem,1.0207rem+0.4049vw,1.375rem)] font-bold">{{ formatFans(a.nb_fan) }}</span>
                    </div>
                  }
                  @if (a.nb_album !== undefined) {
                    <div class="flex flex-col gap-1">
                      <span class="font-display italic text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-bone-700 uppercase tracking-[0.5px]">Álbumes</span>
                      <span class="text-[clamp(1.125rem,1.0207rem+0.4049vw,1.375rem)] font-bold">{{ a.nb_album }}</span>
                    </div>
                  }
                </div>

                @if (a.link) {
                  <a
                    [href]="a.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-block py-2.5 px-5 bg-accent-track text-ink rounded-sm no-underline text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] font-semibold transition-opacity duration-fast ease-smooth hover:opacity-80 md:w-fit"
                  >
                    Ver en Deezer
                  </a>
                }
              </div>
            }
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h2 class="font-body text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-bone-700 font-semibold tracking-[0.05em] uppercase m-0">
            Canciones populares
          </h2>

          @if (loading()) {
            <div class="flex flex-col items-center gap-4 py-10 px-5 text-bone-600 text-center [animation:fadeIn_300ms_var(--ease)_both]">
              <app-spinner size="md" />
              <span class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] italic">Cargando canciones...</span>
            </div>
          } @else if (tracks().length === 0) {
            <div class="text-center py-10 px-5 text-bone-700 text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] [animation:fadeIn_300ms_var(--ease)_both]">
              No hay canciones disponibles
            </div>
          } @else {
            <div class="flex flex-col [&>*]:[animation:rowEnter_var(--dur-base)_var(--ease)_both]">
              @for (track of tracks(); track track.id) {
                <app-search-result-item
                  [item]="track"
                  type="track"
                  [isAdded]="isInWishlist(track.id)"
                  [showAddButton]="true"
                  [showTypeChip]="false"
                  (onAddClick)="toggle($event)"
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

  goBack() {
    this.router.navigate(['']);
  }

  formatFans = formatFans;
}
