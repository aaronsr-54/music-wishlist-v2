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
import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';
import { ReleaseItem } from '../../shared/models/release-item.model';

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
  imports: [CommonModule, SearchResultItemComponent],
  template: `
    <div class="panel">
      <div class="eyebrow">
        <span class="label">
          <span class="label--number">01/</span> LANZAMIENTOS
        </span>
      </div>

      <div class="releases-container">
        <div class="month-selector">
          <button class="nav-btn" (click)="prevMonth()" title="Mes anterior">
            ←
          </button>
          <span class="month-label">{{ monthLabel() }}</span>
          <button class="nav-btn" (click)="nextMonth()" title="Mes siguiente">
            →
          </button>
        </div>

        @if (loading()) {
          <div class="loading">Cargando lanzamientos...</div>
        } @else if (filteredReleases().length === 0) {
          <div class="empty">
            @if (favorites().length === 0) {
              Añade artistas a favoritos para ver sus lanzamientos
            } @else {
              Sin lanzamientos en {{ monthLabel() }}
            }
          </div>
        } @else {
          <div class="releases-list">
            @for (item of filteredReleases(); track item.id) {
              <app-search-result-item
                class="result-item"
                [item]="item"
                source="releases"
              />
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        padding: 0.5rem 1rem;
        gap: 1rem;
      }

      .eyebrow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .label {
        font-family: var(--font-display);
        font-size: 12px;
        color: var(--bone);
        font-weight: 700;
        letter-spacing: 0.06em;
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
        padding: 0.5rem 1rem;
        gap: 1.5rem;
        overflow: auto;
      }

      .month-selector {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 12px 16px;
        background: var(--ink-100);
        border-radius: var(--radius-md);
      }

      .nav-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: none;
        color: var(--bone);
        cursor: pointer;
        font-size: 18px;
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

      .month-label {
        font-family: var(--font-display);
        font-size: 14px;
        color: var(--bone);
        font-weight: 600;
        letter-spacing: 0.04em;
        min-width: 150px;
        text-align: center;
      }

      .loading,
      .empty {
        text-align: center;
        padding: 40px 20px;
        color: var(--bone-700);
        font-size: 14px;
      }

      .releases-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .result-item {
        display: block;
      }
    `,
  ],
})
export class ReleasesComponent implements OnInit {
  private searchSvc = inject(SearchService);
  private favoritesSvc = inject(FavoritesService);

  selectedYear = signal<number>(new Date().getFullYear());
  selectedMonth = signal<number>(new Date().getMonth());

  allReleases = signal<ReleaseItem[]>([]);
  loading = signal(false);

  favorites = this.favoritesSvc.favorites;

  monthLabel = computed(() => {
    const month = this.selectedMonth();
    const year = this.selectedYear();
    return `${MONTHS[month]} ${year}`;
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

  constructor() {
    effect(() => {
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
    let month = this.selectedMonth() + 1;
    let year = this.selectedYear();

    if (month > 11) {
      month = 0;
      year++;
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

    const releaseObservables = favorites.map((fav) =>
      this.searchSvc
        .getArtistReleases(fav.artistId)
        .pipe(catchError(() => of([]))),
    );

    forkJoin(releaseObservables).subscribe((results) => {
      const allReleases = results.flat();
      this.allReleases.set(allReleases);
      this.loading.set(false);
    });
  }
}
