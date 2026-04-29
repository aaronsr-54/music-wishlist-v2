import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
} from 'rxjs';
import { Subscription } from 'rxjs';
import { SearchService } from '../../core/api/search.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { AuthService } from '../../core/auth/auth.service';
import { Track, TrackType } from '../../shared/models/track.model';
import { SkeletonRowComponent } from '../../shared/components/skeleton-row/skeleton-row.component';
import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';
import { Router } from '@angular/router';

type SearchState = 'idle' | 'loading' | 'results' | 'empty';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, SkeletonRowComponent, SearchResultItemComponent],
  template: `
    <div class="panel">
      <div class="eyebrow">
        <span class="label"
          ><span class="label--number">02/</span> BUSCADOR</span
        >
      </div>

      <div class="search-field" [class.has-value]="query()">
        <svg
          class="search-icon"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <circle
            cx="8.5"
            cy="8.5"
            r="5.75"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M13.5 13.5L17 17"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar canciones, álbumes..."
          [ngModel]="query()"
          (ngModelChange)="onQuery($event)"
          class="search-input"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />
        @if (query()) {
          <button class="clear-btn" (click)="clearQuery()" aria-label="Limpiar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        }
      </div>

      @if (query()) {
        <div class="filter-pills">
          <button
            class="filter-pill"
            [class.active]="selectedTypes().has('artist')"
            (click)="toggleType('artist')"
          >
            Artistas
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedTypes().has('track')"
            (click)="toggleType('track')"
          >
            Canciones
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedTypes().has('album')"
            (click)="toggleType('album')"
          >
            Álbums
          </button>
          <button
            class="filter-pill"
            [class.active]="selectedTypes().has('ep')"
            (click)="toggleType('ep')"
          >
            EPs
          </button>
        </div>
      }

      @switch (state()) {
        @case ('idle') {
          <div class="results">
            <div class="empty-state">
              <div class="empty-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle
                    cx="13"
                    cy="13"
                    r="8.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <path
                    d="M19.5 19.5L26 26"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <p class="empty-title">Empieza a escribir</p>
              <p class="empty-sub">
                Canciones, álbumes o EPs — busca lo que quieras y lo encontramos
                en Deezer.
              </p>
            </div>
          </div>
        }
        @case ('loading') {
          <div class="results">
            @for (_ of skeletons; track $index) {
              <app-skeleton-row [size]="56" />
            }
          </div>
        }
        @case ('results') {
          @if (filteredArtists().length > 0) {
            <div class="results">
              @for (artist of filteredArtists(); track artist.id) {
                <app-search-result-item
                  class="result-item"
                  [item]="artist"
                  type="artist"
                  (onArtistClick)="goToArtist($event)"
                />
              }
            </div>
          }
          @if (filteredTracks().length > 0) {
            <div class="results">
              @for (track of filteredTracks(); track track.id) {
                <app-search-result-item
                  class="result-item"
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
          <div class="results">
            <div class="empty-state">
              <p class="empty-title">Sin resultados</p>
              <p class="empty-sub">Prueba con otro término de búsqueda</p>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .panel {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
        overflow: hidden;
        padding: 0.5rem 1rem 0 1rem;
      }

      .eyebrow {
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: space-between;
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

      .search-field {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 1rem 0;
        border-bottom: 1.5px solid var(--ink-100);
        transition: border-color var(--dur-fast) var(--ease);
      }

      .search-icon {
        color: var(--bone-800);
        width: 12px;
        flex-shrink: 0;
      }

      .search-input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        color: var(--bone);
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 400;
      }

      .search-input::placeholder {
        color: var(--bone-800);
        font-style: italic;
      }

      .clear-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--bone-600);
        padding: 2px;
        display: flex;
        align-items: center;
        border-radius: 50%;
        transition: color var(--dur-fast) var(--ease);
      }

      .clear-btn:hover {
        color: var(--bone);
      }

      .filter-pills {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        animation: slideDown 200ms var(--ease) both;
      }

      .filter-pill {
        padding: 6px 12px;
        border-radius: 20px;
        border: 1.5px solid var(--ink-200);
        background: transparent;
        color: var(--bone-600);
        font-family: var(--font-display);
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        cursor: pointer;
        transition:
          background var(--dur-fast) var(--ease),
          color var(--dur-fast) var(--ease),
          border-color var(--dur-fast) var(--ease);
      }

      .filter-pill:hover {
        border-color: var(--bone-600);
        color: var(--bone);
      }

      .filter-pill.active {
        background: var(--bone);
        border-color: var(--bone);
        color: var(--ink);
      }

      .results {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        scrollbar-width: none;
        -webkit-mask-image: linear-gradient(
          to bottom,
          transparent 0%,
          black 16px,
          black 80%,
          transparent 100%
        );
        mask-image: linear-gradient(
          to bottom,
          transparent 0%,
          black 16px,
          black 80%,
          transparent 100%
        );

        padding-top: 1rem;
      }

      .results::-webkit-scrollbar {
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
        color: var(--bone-800);
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
export class SearchComponent implements OnInit, OnDestroy {
  private search = inject(SearchService);
  private wishlistSvc = inject(WishlistService);
  private authSvc = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  query = signal('');
  selectedTypes = signal<Set<TrackType>>(new Set());

  results = signal<Track[]>([]);

  artists = computed(() =>
    this.results().filter((track) => track.type === 'artist'),
  );

  tracks = computed(() =>
    this.results().filter((track) => track.type !== 'artist'),
  );

  filteredArtists = computed(() => {
    const types = this.selectedTypes();
    return types.has('artist') ? this.artists() : [];
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

  skeletons = new Array(20);

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
        debounceTime(220),
        distinctUntilChanged(),
        switchMap((q) => {
          const trimmed = q.trim();

          if (!trimmed) {
            this.loading.set(false);
            this.results.set([]);
            return of([]);
          }

          this.loading.set(true);

          return this.search.search(trimmed).pipe(catchError(() => of([])));
        }),
      )
      .subscribe((res) => {
        this.results.set(res);
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
  }

  isAdded(trackId: string): boolean {
    return this.wishlistSvc.trackIds().has(trackId);
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

  goToArtist(artist: Track) {
    this.search.saveSearchState(
      this.query(),
      this.selectedTypes(),
      this.results(),
    );
    this.router.navigate(['/artist', artist.artistId || artist.id]);
  }

  formatFans(count: number): string {
    if (count >= 1000000)
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000)
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return count.toString();
  }
}
