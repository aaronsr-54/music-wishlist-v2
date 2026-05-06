import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
  tap,
} from 'rxjs';

import { register } from 'swiper/element/bundle';

import { SearchService } from '../../core/api/search.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { FavoriteArtistsService } from '../../core/firebase/favorite-artists.service';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/i18n/language.service';
import { Track, TrackType } from '../../shared/models/track.model';
import { formatFans } from '../../shared/utils/format-fans';

import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ArtistCardComponent } from '../../shared/components/artist-card/artist-card.component';
import {
  TypeFilterComponent,
  FilterType,
} from '../../shared/components/type-filter/type-filter.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchEmptyStateComponent } from '../../shared/components/search-empty-state/search-empty-state.component';

register();

@Component({
  selector: 'app-search',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    SearchResultItemComponent,
    SpinnerComponent,
    ArtistCardComponent,
    TypeFilterComponent,
    SearchInputComponent,
    PageHeaderComponent,
    SearchEmptyStateComponent,
  ],
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .scroll-fade {
      flex: 1;
      overflow-y: auto;
      scrollbar-width: none;
      padding: 4px 0 2rem;
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
    swiper-container {
      display: block;
      width: 100%;
    }
    swiper-slide {
      width: 80px;
      cursor: grabbing !important;
    }
    .artist-anim {
      animation: fadeInRight 0.5s ease-out both;
    }
    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(15px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `,
  template: `
    <div
      class="flex flex-col justify-between h-full overflow-hidden p-0.5 pt-2"
    >
      <section class="flex flex-col gap-4 flex-1 min-h-0">
        <app-page-header prefix="02/" title="BUSCADOR" [mobileOnly]="true" [showBack]="false" />

        <app-search-input
          [query]="query()"
          [placeholder]="t().searchPlaceholder"
          [clearLabel]="t().clear"
          (queryChange)="onQuery($event)"
          (clear)="clearQuery()"
        />

        @if (query()) {
          <app-type-filter
            [options]="typeFilterOptions()"
            [selectedTypes]="selectedTypes()"
            (toggle)="toggleType($event)"
          />
        }

        @switch (state()) {
          @case ('loading') {
            <div
              class="scroll-fade flex items-center justify-center min-h-[300px]"
            >
              <div
                class="flex flex-col items-center gap-4 text-ink-600 dark:text-bone-600"
              >
                <app-spinner size="md" />
                <span class="italic text-sm">Buscando...</span>
              </div>
            </div>
          }
          @case ('results') {
            <div class="scroll-fade">
              @for (item of filteredResults(); track item.id) {
                <app-search-result-item
                  class="[animation:rowEnter_var(--dur-base)_var(--ease)_both]"
                  [item]="item"
                  [type]="item.type"
                  [isAdded]="isAdded(item.id, item.type)"
                  [showAddButton]="true"
                  [showTypeChip]="showTypeChip()"
                  (onArtistClick)="goToArtist($event)"
                  (onAlbumClick)="goToAlbum($event)"
                  (onAddClick)="toggleAction($event)"
                />
              }
            </div>
          }
          @case ('empty') {
            <app-search-empty-state
              variant="empty"
              [title]="t().noResults"
              [subtitle]="t().tryAnotherSearch"
            />
          }
          @default {
            <app-search-empty-state
              variant="idle"
              [title]="t().startSearching"
              [subtitle]="t().searchSubtitle"
            />
          }
        }
      </section>

      @if (!query() && favoriteArtists().length > 0) {
        <div
          class="py-3 pb-6 border-t border-bone-100 dark:border-ink-100 [animation:fadeIn_200ms_var(--ease)_both]"
        >
          <h3
            class="font-display text-xs font-bold text-ink-700 dark:text-bone-700 mb-3 uppercase tracking-wider px-2"
          >
            {{ t().favoriteArtists }}
          </h3>
          <swiper-container
            slides-per-view="auto"
            space-between="12"
            free-mode="true"
            grab-cursor="true"
            class="px-2"
          >
            @for (artist of favoriteArtists(); track artist.id) {
              <swiper-slide>
                <app-artist-card
                  class="artist-anim"
                  [artist]="artist"
                  (click)="goToArtist(artist)"
                  (onRemoveFavorite)="removeFavorite($event)"
                />
              </swiper-slide>
            }
          </swiper-container>
        </div>
      }
    </div>
  `,
})
export class SearchComponent {
  private searchSvc = inject(SearchService);
  private wishlistSvc = inject(WishlistService);
  private favoriteArtistsSvc = inject(FavoriteArtistsService);
  private authSvc = inject(AuthService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  t = computed(() => this.languageService.t());
  query = signal(this.searchSvc.getSavedSearchState()?.query || '');
  selectedTypes = signal<Set<TrackType>>(
    this.searchSvc.getSavedSearchState()?.selectedTypes || new Set(),
  );
  loading = signal(false);

  favoriteArtists = this.favoriteArtistsSvc.artists;

  private results$ = toObservable(this.query).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap((q) => {
      if (q.trim()) this.loading.set(true);
    }),
    switchMap((q) => {
      const trimmed = q.trim();
      if (!trimmed) return of([]);
      return this.searchSvc.search(trimmed).pipe(
        catchError(() => of([])),
        tap(() => this.loading.set(false)),
      );
    }),
    tap((res) => {
      this.searchSvc.saveSearchState(this.query(), this.selectedTypes(), res);
      this.loading.set(false);
    }),
  );

  results = toSignal(this.results$, {
    initialValue: this.searchSvc.getSavedSearchState()?.results || [],
  });

  filteredResults = computed(() => {
    const res = this.results();
    const types = this.selectedTypes();
    if (types.size > 0) return res.filter((item) => types.has(item.type));
    let artistCount = 0;
    return res.filter((item) => {
      if (item.type !== 'artist') return true;
      return ++artistCount <= 3;
    });
  });

  showTypeChip = computed(() => this.selectedTypes().size !== 1);

  state = computed(() => {
    if (this.loading()) return 'loading';
    if (!this.query().trim()) return 'idle';
    return this.filteredResults().length > 0 ? 'results' : 'empty';
  });

  typeFilterOptions = computed(() => [
    { value: 'artist' as FilterType, label: this.t().artists },
    { value: 'track' as FilterType, label: this.t().songs },
    { value: 'album' as FilterType, label: this.t().albums },
    { value: 'ep' as FilterType, label: this.t().eps },
  ]);

  onQuery(val: string) {
    this.query.set(val);
  }

  clearQuery() {
    this.query.set('');
    this.selectedTypes.set(new Set());
  }

  toggleType(type: string) {
    const typeVal = type as TrackType;
    const updated = new Set(this.selectedTypes());
    updated.has(typeVal)
      ? updated.delete(typeVal)
      : (updated.clear(), updated.add(typeVal));
    this.selectedTypes.set(updated);
    this.searchSvc.saveSearchState(this.query(), updated, this.results());
  }

  isAdded(id: string, type?: string): boolean {
    return type === 'artist'
      ? this.favoriteArtistsSvc.artistIds().has(id)
      : this.wishlistSvc.trackIds().has(id);
  }

  async toggleAction(track: Track) {
    const user = this.authSvc.currentUser();
    if (!user) return;

    if (track.type === 'artist') {
      const existing = this.favoriteArtistsSvc
        .artists()
        .find((a) => a.artistId === track.id);
      if (existing?.id) {
        await this.favoriteArtistsSvc.remove(existing.id);
      } else {
        const cover = track.coverUrl || (await this.fetchArtistImage(track.id));
        await this.favoriteArtistsSvc.add(track.id, track.name, cover, user);
      }
    } else {
      const existing = this.wishlistSvc
        .entries()
        .find((e) => e.trackId === track.id);
      existing?.id
        ? await this.wishlistSvc.remove(existing.id)
        : await this.wishlistSvc.add(track, user);
    }
  }

  private async fetchArtistImage(id: string): Promise<string> {
    try {
      const data: any = await this.searchSvc.getArtist(id).toPromise();
      return data?.picture_big || data?.picture_medium || '';
    } catch {
      return '';
    }
  }

  removeFavorite(artistId: string) {
    const item = this.favoriteArtistsSvc
      .artists()
      .find((a) => a.artistId === artistId);
    if (item?.id) this.favoriteArtistsSvc.remove(item.id);
  }

  goToArtist(artist: any) {
    this.router.navigate(['/artist', artist.artistId || artist.id]);
  }

  goToAlbum(albumId: string) {
    this.router.navigate(['/album', albumId]);
  }
}
