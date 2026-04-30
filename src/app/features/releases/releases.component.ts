import {
  Component,
  computed,
  effect,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SearchService } from '../../core/api/search.service';
import { FavoritesService } from '../../core/firebase/favorites.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { AuthService } from '../../core/auth/auth.service';
import { ReleaseItem } from '../../shared/models/release-item.model';
import { CardItemComponent } from '../../shared/components/card-item/card-item.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

@Component({
  selector: 'app-releases',
  standalone: true,
  imports: [CommonModule, CardItemComponent, SpinnerComponent, EmptyStateComponent],
  template: `
    <div class="panel">
      <div class="eyebrow">
        <span class="label">
          <span class="label--number">01/</span> LANZAMIENTOS
        </span>
      </div>

      <div class="releases-container">
        <div class="month-selector-container">
          <div class="month-selector">
            <button class="nav-btn" (click)="prevMonth()" title="Mes anterior">
              <
            </button>
            <span class="date-label">
              <span class="month-label">{{ monthLabel() }}</span>
              <span class="year-label">{{ yearLabel() }}</span>
            </span>
            <button
              class="nav-btn"
              [class.disabled]="!canGoToNextMonth()"
              [disabled]="!canGoToNextMonth()"
              (click)="nextMonth()"
              title="Mes siguiente"
            >
              >
            </button>
          </div>
        </div>

        @if (loading()) {
          <div class="releases-loading">
            <app-spinner size="md" />
            <span class="releases-loading__text">Cargando lanzamientos...</span>
          </div>
        } @else if (filteredReleases().length === 0) {
          <app-empty-state
            [icon]="favorites().length === 0 ? 'heart' : 'music-note'"
            [title]="favorites().length === 0 ? 'Sin artistas' : 'Sin lanzamientos'"
            [subtitle]="favorites().length === 0 ? 'Busca tus artistas favoritos y añádelos aquí.' : 'Ninguno de tus artistas favoritos ha lanzado algo este mes. Añade más artistas a tu lista de favoritos.'"
          />
        } @else {
          <div class="releases-list">
            @for (item of filteredReleases(); track item.id + ':' + item.type) {
              <app-card-item
                class="result-item"
                [item]="item"
                [isAdded]="isInWishlist(item.id)"
                (toggleWishlist)="toggleWishlist($event)"
              />
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
      }

      .panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        padding: 0.5rem 1rem 0 1rem;
        gap: 1rem;
        width: 100%;
        animation: fadeIn 300ms ease both;
      }

      .eyebrow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .label {
        font-family: var(--font-display);
        font-size: clamp(0.75rem, 0.6457rem + 0.4049vw, 1rem);
        color: var(--bone);
        font-weight: 700;
        letter-spacing: 0.06em;

        @media (min-width: 768px) {
          display: none;
        }
      }

      .label--number {
        color: var(--bone-700);
        font-weight: 400;
        font-style: italic;
      }

      .releases-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding-bottom: 2rem;
      }

      .month-selector-container {
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 1.5px solid var(--ink-100);
        animation: slideDown 300ms ease both;
      }

      .month-selector {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        padding: 4px 0;
        width: 100%;

        @media (min-width: 768px) {
          width: 20rem;
          margin-inline: auto;
        }
      }

      .nav-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: none;
        color: var(--bone);
        cursor: pointer;
        font-size: clamp(1.125rem, 1.0207rem + 0.4049vw, 1.375rem);
        font-weight: 600;
        transition:
          color var(--dur-fast) var(--ease),
          transform var(--dur-fast) var(--ease);
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .nav-btn:hover {
        color: var(--bone-100);
        transform: scale(1.15);
      }

      .nav-btn:active {
        transform: scale(0.9);
      }

      .nav-btn:disabled,
      .nav-btn.disabled {
        opacity: 0.2;
        cursor: not-allowed;
        pointer-events: none;
      }

      .date-label {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: clamp(1.5rem, 1.3957rem + 0.4049vw, 1.75rem);
        color: var(--bone);
        min-width: 150px;
        text-align: center;
        text-transform: uppercase;
        padding: 16px 0;
        transition: opacity 200ms ease;
      }

      .month-label {
        font-weight: 600;
        letter-spacing: 0.04em;
      }

      .year-label {
        font-family: var(--font-display);
        color: var(--bone-700);
        font-weight: 300;
        font-style: italic;
        margin-top: -3px;
      }

      .releases-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        min-height: 300px;
        padding: 40px 20px;
        color: var(--bone-600);
        text-align: center;
        animation: fadeIn 300ms ease both;
      }

      .releases-loading__text {
        font-size: clamp(0.875rem, 0.7707rem + 0.4049vw, 1.125rem);
        font-style: italic;
      }

      .empty {
        text-align: center;
        padding: 40px 20px;
        color: var(--bone-700);
        font-size: clamp(0.875rem, 0.7707rem + 0.4049vw, 1.125rem);
        animation: fadeIn 400ms ease both;
      }

      .releases-list {
        min-width: 0;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-rows: max-content;
        gap: 8px;
        overflow: auto;
        scrollbar-width: none;
        height: 100%;
        padding-top: 16px;
        animation: fadeIn 300ms ease both;

        padding-bottom: 2rem;
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

        @media (min-width: 1100px) and (max-width: 1623px) {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        @media (min-width: 1624px) and (max-width: 1899px) {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        @media (min-width: 1900px) {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }
      }

      .result-item {
        animation: scaleIn 300ms ease both;
      }

      .result-item:nth-child(1) {
        animation-delay: 0ms;
      }
      .result-item:nth-child(2) {
        animation-delay: 30ms;
      }
      .result-item:nth-child(3) {
        animation-delay: 60ms;
      }
      .result-item:nth-child(4) {
        animation-delay: 90ms;
      }
      .result-item:nth-child(5) {
        animation-delay: 120ms;
      }
      .result-item:nth-child(6) {
        animation-delay: 150ms;
      }
      .result-item:nth-child(7) {
        animation-delay: 180ms;
      }
      .result-item:nth-child(8) {
        animation-delay: 210ms;
      }
      .result-item:nth-child(9) {
        animation-delay: 240ms;
      }
      .result-item:nth-child(10) {
        animation-delay: 270ms;
      }
      .result-item:nth-child(11) {
        animation-delay: 300ms;
      }
      .result-item:nth-child(12) {
        animation-delay: 330ms;
      }
      .result-item:nth-child(13) {
        animation-delay: 360ms;
      }
      .result-item:nth-child(14) {
        animation-delay: 390ms;
      }
      .result-item:nth-child(15) {
        animation-delay: 420ms;
      }
      .result-item:nth-child(16) {
        animation-delay: 450ms;
      }
      .result-item:nth-child(17) {
        animation-delay: 480ms;
      }
      .result-item:nth-child(18) {
        animation-delay: 510ms;
      }
      .result-item:nth-child(19) {
        animation-delay: 540ms;
      }
      .result-item:nth-child(20) {
        animation-delay: 570ms;
      }

    `,
  ],
})
export class ReleasesComponent implements OnInit {
  private searchSvc = inject(SearchService);
  private favoritesSvc = inject(FavoritesService);
  private wishlistSvc = inject(WishlistService);
  private authSvc = inject(AuthService);

  selectedYear = signal<number>(new Date().getFullYear());
  selectedMonth = signal<number>(new Date().getMonth());

  allReleases = signal<ReleaseItem[]>([]);
  loading = signal(false);

  favorites = this.favoritesSvc.favorites;

  monthLabel = computed(() => {
    const month = this.selectedMonth();
    return `${MONTHS[month]}`;
  });

  yearLabel = computed(() => {
    return this.selectedYear().toString();
  });

  canGoToNextMonth = computed(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const selectedYear = this.selectedYear();
    const selectedMonth = this.selectedMonth();

    return !(selectedYear === currentYear && selectedMonth === currentMonth);
  });

  filteredReleases = computed(() => {
    const month = this.selectedMonth();
    const year = this.selectedYear();

    return this.allReleases()
      .filter((release) => {
        if (!release.releaseDate) return false;
        const [releaseYear, releaseMonth] = release.releaseDate
          .split('-')
          .slice(0, 2)
          .map(Number);
        return releaseYear === year && releaseMonth - 1 === month;
      })
      .sort((a, b) => {
        const dateA = new Date(a.releaseDate).getTime();
        const dateB = new Date(b.releaseDate).getTime();
        return dateB - dateA;
      });
  });

  isInWishlist(itemId: string): boolean {
    return this.wishlistSvc.entries().some((e) => e.trackId === itemId);
  }

  constructor() {
    effect(() => {
      this.favorites();
      this.loadReleases();
    });
  }

  ngOnInit() {}

  prevMonth() {
    let month = this.selectedMonth() - 1;
    let year = this.selectedYear();

    if (month < 0) {
      month = 11;
      year--;
    }

    this.selectedMonth.set(month);
    this.selectedYear.set(year);
  }

  nextMonth() {
    if (!this.canGoToNextMonth()) return;

    let month = this.selectedMonth() + 1;
    let year = this.selectedYear();

    if (month > 11) {
      month = 0;
      year++;
    }

    const now = new Date();
    if (
      year > now.getFullYear() ||
      (year === now.getFullYear() && month > now.getMonth())
    ) {
      return;
    }

    this.selectedMonth.set(month);
    this.selectedYear.set(year);
  }

  private loadReleases() {
    const favorites = this.favoritesSvc.favorites();

    if (favorites.length === 0) {
      this.allReleases.set([]);
      return;
    }

    this.loading.set(true);

    const releaseObservables = favorites.map((fav) => {
      return this.searchSvc.getArtistReleases(fav.artistId, fav.name).pipe(
        catchError((err) => {
          console.error(`Error loading releases for ${fav.name}:`, err);
          return of([]);
        }),
      );
    });

    forkJoin(releaseObservables).subscribe((results) => {
      const allReleases = results.flat();
      const seen = new Set<string>();
      const deduplicated = allReleases.filter((r) => {
        const key = `${r.id}:${r.type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      this.allReleases.set(deduplicated);
      this.loading.set(false);
    });
  }

  openInYouTube(item: ReleaseItem) {
    const query = `${item.artist} ${item.name}`;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  }

  async toggleWishlist(item: ReleaseItem) {
    const entry = this.wishlistSvc.entries().find((e) => e.trackId === item.id);

    if (entry && entry.id) {
      await this.wishlistSvc.remove(entry.id);
    } else {
      const user = this.authSvc.currentUser();
      if (!user) return;
      await this.wishlistSvc.addRelease(item, user);
    }
  }
}
