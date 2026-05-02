import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
  Subscription,
} from 'rxjs';
import { SearchService } from '../../core/api/search.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { FavoriteArtistsService } from '../../core/firebase/favorite-artists.service';
import { AuthService } from '../../core/auth/auth.service';
import { Track, TrackType } from '../../shared/models/track.model';
import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ArtistCardComponent } from '../../shared/components/artist-card/artist-card.component';
import { Router } from '@angular/router';
import { IconComponent } from '../../shared/icons/icon.component';
import { formatFans } from '../../shared/utils/format-fans';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

type SearchState = 'idle' | 'loading' | 'results' | 'empty';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchResultItemComponent,
    SpinnerComponent,
    ArtistCardComponent,
    IconComponent,
    EmptyStateComponent,
  ],
  styles: `
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
        <span
          class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink dark:text-bone font-bold tracking-[0.06em] uppercase md:hidden"
        >
          <span class="text-ink-700 dark:text-bone-700 font-normal italic"
            >02/</span
          >
          BUSCADOR
        </span>
      </div>

      <div
        class="flex items-center gap-2.5 py-4 border-b-[1.5px] border-bone-100 dark:border-ink-100 transition-[border-color] duration-fast ease-smooth"
        [class.border-bone-600]="query()"
      >
        <app-icon
          name="search"
          class="text-ink-800 dark:text-bone-800 w-[clamp(1.5rem,1.3957rem+0.4049vw,1.75rem)] h-[clamp(1.5rem,1.3957rem+0.4049vw,1.75rem)] shrink-0 "
        />
        <input
          id="search-input"
          type="text"
          placeholder="Buscar canciones, álbumes..."
          [ngModel]="query()"
          (ngModelChange)="onQuery($event)"
          class="flex-1 bg-transparent border-none outline-none text-ink dark:text-bone font-display text-[clamp(1.5rem,1.3957rem+0.4049vw,1.75rem)] font-normal placeholder:text-bone-800 placeholder:italic"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
        @if (query()) {
          <button
            class="bg-transparent border-none cursor-pointer text-ink-600 dark:text-bone-600 p-[0.25em] flex items-center rounded-full transition-colors duration-fast ease-smooth text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] hover:text-ink dark:hover:text-bone"
            (click)="clearQuery()"
            aria-label="Limpiar"
          >
            <app-icon
              name="close"
              class="w-[clamp(1.5rem,1.3957rem+0.4049vw,1.75rem)] h-[clamp(1.5rem,1.3957rem+0.4049vw,1.75rem)]"
            />
          </button>
        }
      </div>

      @if (query()) {
        <div
          class="flex gap-2 overflow-x-auto [animation:slideDown_200ms_var(--ease)_both] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            class="px-3 py-1.5 rounded-[20px] border-[1.5px] border-ink-200 bg-transparent text-ink-100 dark:text-bone-600 font-display text-[clamp(0.8125rem,0.7082rem+0.4049vw,1.0625rem)] font-medium whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-fast ease-smooth hover:border-ink dark:hover:border-bone-600 hover:text-ink dark:hover:text-bone [&.active]:bg-ink [&.active]:border-ink [&.active]:text-bone [&.active]:dark:bg-bone [&.active]:dark:border-bone [&.active]:dark:text-ink"
            [class.active]="selectedTypes().has('artist')"
            (click)="toggleType('artist')"
          >
            Artistas
          </button>
          <button
            class="px-3 py-1.5 rounded-[20px] border-[1.5px] border-ink-200 bg-transparent text-ink-100 dark:text-bone-600 font-display text-[clamp(0.8125rem,0.7082rem+0.4049vw,1.0625rem)] font-medium whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-fast ease-smooth hover:border-ink dark:hover:border-bone-600 hover:text-ink dark:hover:text-bone [&.active]:bg-ink [&.active]:border-ink [&.active]:text-bone [&.active]:dark:bg-bone [&.active]:dark:border-bone [&.active]:dark:text-ink"
            [class.active]="selectedTypes().has('track')"
            (click)="toggleType('track')"
          >
            Canciones
          </button>
          <button
            class="px-3 py-1.5 rounded-[20px] border-[1.5px] border-ink-200 bg-transparent text-ink-100 dark:text-bone-600 font-display text-[clamp(0.8125rem,0.7082rem+0.4049vw,1.0625rem)] font-medium whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-fast ease-smooth hover:border-ink dark:hover:border-bone-600 hover:text-ink dark:hover:text-bone [&.active]:bg-ink [&.active]:border-ink [&.active]:text-bone [&.active]:dark:bg-bone [&.active]:dark:border-bone [&.active]:dark:text-ink"
            [class.active]="selectedTypes().has('album')"
            (click)="toggleType('album')"
          >
            Álbums
          </button>
          <button
            class="px-3 py-1.5 rounded-[20px] border-[1.5px] border-ink-200 bg-transparent text-ink-100 dark:text-bone-600 font-display text-[clamp(0.8125rem,0.7082rem+0.4049vw,1.0625rem)] font-medium whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-fast ease-smooth hover:border-ink dark:hover:border-bone-600 hover:text-ink dark:hover:text-bone [&.active]:bg-ink [&.active]:border-ink [&.active]:text-bone [&.active]:dark:bg-bone [&.active]:dark:border-bone [&.active]:dark:text-ink"
            [class.!bg-bone]="selectedTypes().has('ep')"
            (click)="toggleType('ep')"
          >
            EPs
          </button>
        </div>
      }

      @switch (state()) {
        @case ('idle') {
          <div class="scroll-fade">
            <app-empty-state
              icon="search"
              title="Empieza a escribir"
              subtitle="Canciones, álbumes o EPs — busca lo que quieras y lo encontramos en Deezer."
            />
          </div>
        }
        @case ('loading') {
          <div
            class="scroll-fade flex items-center justify-center min-h-[300px]"
          >
            <div
              class="flex flex-col items-center gap-4 py-10 px-5 text-ink-600 dark:text-bone-600 text-center [animation:fadeIn_300ms_var(--ease)_both]"
            >
              <app-spinner size="md" />
              <span
                class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] italic"
                >Buscando...</span
              >
            </div>
          </div>
        }
        @case ('results') {
          @if (filteredArtists().length > 0) {
            <div class="scroll-fade">
              @for (artist of filteredArtists(); track artist.id) {
                <app-search-result-item
                  class="[animation:rowEnter_var(--dur-base)_var(--ease)_both]"
                  [item]="artist"
                  type="artist"
                  [isAdded]="isAdded(artist.id, 'artist')"
                  [showAddButton]="true"
                  (onArtistClick)="goToArtist($event)"
                  (onAddClick)="toggle($event)"
                />
              }
            </div>
          }
          @if (filteredTracks().length > 0) {
            <div class="scroll-fade">
              @for (track of filteredTracks(); track track.id) {
                <app-search-result-item
                  class="[animation:rowEnter_var(--dur-base)_var(--ease)_both]"
                  [item]="track"
                  type="track"
                  [isAdded]="isAdded(track.id)"
                  (onAddClick)="toggle($event)"
                />
              }
            </div>
          }
        }
        @case ('empty') {
          <div class="scroll-fade">
            <app-empty-state
              title="Sin resultados"
              subtitle="Prueba con otro término de búsqueda"
            />
          </div>
        }
      }

      @if (!query() && favoriteArtists().length > 0) {
        <div
          class="py-3 pb-6 border-t border-bone-100 dark:border-ink-100 [animation:fadeIn_200ms_var(--ease)_both]"
        >
          <h3
            class="font-display text-[clamp(0.6875rem,0.6093rem+0.3036vw,0.875rem)] font-bold text-ink-700 dark:text-bone-700 mt-0 mb-3 uppercase tracking-[0.06em] px-2"
          >
            Artistas favoritos
          </h3>
          <div
            class="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-2 [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10px,black_calc(100%-10px),transparent_100%)] [mask-image:linear-gradient(to_right,transparent_0%,black_10px,black_calc(100%-10px),transparent_100%)]"
          >
            @for (artist of favoriteArtists(); track artist.id) {
              <app-artist-card
                class="flex-[0_0_80px] min-w-[80px]"
                [artist]="artist"
                (onArtistClick)="navigateToArtist($event)"
                (onRemoveFavorite)="removeFavorite($event)"
              />
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SearchComponent implements OnInit, OnDestroy {
  private search = inject(SearchService);
  private wishlistSvc = inject(WishlistService);
  private favoriteArtistsSvc = inject(FavoriteArtistsService);
  private authSvc = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  query = signal('');
  selectedTypes = signal<Set<TrackType>>(new Set());

  results = signal<Track[]>([]);

  favoriteArtists = computed(() => this.favoriteArtistsSvc.artists());

  artists = computed(() =>
    this.results().filter((track) => track.type === 'artist'),
  );

  tracks = computed(() =>
    this.results().filter((track) => track.type !== 'artist'),
  );

  filteredArtists = computed(() => {
    const types = this.selectedTypes();
    if (types.has('artist')) {
      return this.artists();
    }
    return [];
  });

  filteredTracks = computed(() => {
    const types = this.selectedTypes();
    if (types.size === 0) return this.tracks();
    if (types.has('artist')) return [];
    return this.tracks().filter((track) => types.has(track.type));
  });

  state = computed<SearchState>(() => {
    const q = this.query().trim();
    const artists = this.filteredArtists();
    const tracks = this.filteredTracks();
    const loading = this.loading();

    if (!q) return 'idle';
    if (loading) return 'loading';
    if (!artists.length && !tracks.length) return 'empty';

    return 'results';
  });

  private search$ = new Subject<string>();
  private sub?: Subscription;

  ngOnInit() {
    const savedState = this.search.getSavedSearchState();
    if (savedState) {
      this.query.set(savedState.query);
      this.selectedTypes.set(savedState.selectedTypes);
      this.results.set(savedState.results);
    }

    this.sub = this.search$
      .pipe(
        debounceTime(0),
        distinctUntilChanged(),
        switchMap((q) => {
          const trimmed = q.trim();

          if (!trimmed) {
            this.clearQuery();
            return of([]);
          }

          this.loading.set(true);

          return this.search.search(trimmed).pipe(catchError(() => of([])));
        }),
      )
      .subscribe((res) => {
        this.results.set(res);
        this.search.saveSearchState(
          this.query(),
          this.selectedTypes(),
          this.results(),
        );
        this.loading.set(false);
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onQuery(val: string) {
    this.query.set(val);
    this.search$.next(val);
  }

  clearQuery() {
    this.query.set('');
    this.results.set([]);
    this.selectedTypes.set(new Set());
    this.search$.next('');
  }

  toggleType(type: TrackType) {
    const current = this.selectedTypes();
    const updated = new Set(current);
    if (updated.has(type)) {
      updated.clear();
    } else {
      updated.clear();
      updated.add(type);
    }
    this.selectedTypes.set(updated);

    this.search.saveSearchState(
      this.query(),
      this.selectedTypes(),
      this.results(),
    );
  }

  isAdded(trackId: string, type?: TrackType): boolean {
    if (type === 'artist') {
      return this.favoriteArtistsSvc.artistIds().has(trackId);
    }
    return this.wishlistSvc.trackIds().has(trackId);
  }

  async toggle(track: Track) {
    const user = this.authSvc.currentUser();
    if (!user) return;

    if (track.type === 'artist') {
      const artists = this.favoriteArtistsSvc.artists();
      const existing = artists.find((a) => a.artistId === track.id);
      if (existing && existing.id) {
        await this.favoriteArtistsSvc.remove(existing.id);
      } else {
        let coverUrl = track.coverUrl;
        if (!coverUrl || !coverUrl.trim()) {
          try {
            const artistData = await this.search
              .getArtist(track.id)
              .toPromise();
            coverUrl =
              artistData?.picture_big ?? artistData?.picture_medium ?? '';
          } catch {}
        }
        await this.favoriteArtistsSvc.add(track.id, track.name, coverUrl, user);
      }
    } else {
      const entries = this.wishlistSvc.entries();
      const existing = entries.find((e) => e.trackId === track.id);

      if (existing && existing.id) {
        await this.wishlistSvc.remove(existing.id);
      } else {
        await this.wishlistSvc.add(track, user);
      }
    }
  }

  goToArtist(artist: Track) {
    this.router.navigate(['/artist', artist.artistId || artist.id]);
  }

  navigateToArtist(artist: any) {
    this.router.navigate(['/artist', artist.artistId]);
  }

  removeFavorite(artistId: string) {
    const artists = this.favoriteArtistsSvc.artists();
    const existing = artists.find((a) => a.artistId === artistId);
    if (existing && existing.id) {
      this.favoriteArtistsSvc.remove(existing.id);
    }
  }

  formatFans = formatFans;
}
