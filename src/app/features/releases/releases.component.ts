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
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

@Component({
  selector: 'app-releases',
  standalone: true,
  imports: [CommonModule, CardItemComponent, SpinnerComponent, EmptyStateComponent],
  template: `
    <div class="panel w-full [animation:fadeIn_300ms_ease_both]">
      <div class="eyebrow">
        <span class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-bone font-bold tracking-[0.06em] md:hidden">
          <span class="text-bone-700 font-normal italic">01/</span> LANZAMIENTOS
        </span>
      </div>

      <div class="flex flex-col h-full pb-8" (touchstart)="onTouchStart($event)" (touchend)="onTouchEnd($event)">
        <div class="flex items-center justify-center border-b-[1.5px] border-ink-100 [animation:slideDown_300ms_ease_both]">
          <div class="flex items-center justify-between gap-8 py-1 w-full md:w-80 md:mx-auto">
            <button
              class="w-8 h-8 border-none bg-transparent text-bone cursor-pointer text-[clamp(1.125rem,1.0207rem+0.4049vw,1.375rem)] font-semibold transition-[color,transform] duration-fast ease-smooth p-0 flex items-center justify-center hover:text-bone-100 hover:scale-[1.15] active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed disabled:pointer-events-none"
              (click)="prevMonth()"
              title="Mes anterior"
            >
              &lt;
            </button>
            <span class="flex items-center justify-center gap-2 text-[clamp(1.5rem,1.3957rem+0.4049vw,1.75rem)] text-bone min-w-[150px] text-center uppercase py-4 transition-opacity duration-[200ms] ease-[ease]">
              <span class="font-semibold tracking-[0.04em]">{{ monthLabel() }}</span>
              <span class="font-display text-bone-700 font-light italic -mt-[3px]">{{ yearLabel() }}</span>
            </span>
            <button
              class="w-8 h-8 border-none bg-transparent text-bone cursor-pointer text-[clamp(1.125rem,1.0207rem+0.4049vw,1.375rem)] font-semibold transition-[color,transform] duration-fast ease-smooth p-0 flex items-center justify-center hover:text-bone-100 hover:scale-[1.15] active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed disabled:pointer-events-none"
              [disabled]="!canGoToNextMonth()"
              (click)="nextMonth()"
              title="Mes siguiente"
            >
              &gt;
            </button>
          </div>
        </div>

        @if (loading()) {
          <div class="flex flex-col items-center justify-center gap-4 min-h-[300px] py-10 px-5 text-bone-600 text-center [animation:fadeIn_300ms_ease_both]">
            <app-spinner size="md" />
            <span class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] italic">Cargando lanzamientos...</span>
          </div>
        } @else if (filteredReleases().length === 0) {
          <app-empty-state
            [icon]="favorites().length === 0 ? 'heart' : 'music-note'"
            [title]="favorites().length === 0 ? 'Sin artistas' : 'Sin lanzamientos'"
            [subtitle]="favorites().length === 0 ? 'Busca tus artistas favoritos y añádelos aquí.' : 'Ninguno de tus artistas favoritos ha lanzado algo este mes. Añade más artistas a tu lista de favoritos.'"
          />
        } @else {
          <div class="releases-grid transition-opacity duration-300" [class.opacity-0]="animatingMonth()">
            @for (item of filteredReleases(); track item.id + ':' + item.type; let i = $index) {
              <app-card-item
                class="[animation:scaleIn_300ms_ease_both]"
                [style.animation-delay]="i * 30 + 'ms'"
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
  animatingMonth = signal(false);

  favorites = this.favoritesSvc.favorites;

  private touchStartX = 0;
  private readonly SWIPE_THRESHOLD = 50;

  monthLabel = computed(() => MONTHS[this.selectedMonth()]);
  yearLabel = computed(() => this.selectedYear().toString());

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

  onTouchStart(e: TouchEvent) {
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
    }
  }

  onTouchEnd(e: TouchEvent) {
    if (e.changedTouches.length === 0) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = this.touchStartX - touchEndX;

    if (Math.abs(diff) < this.SWIPE_THRESHOLD) return;

    this.animatingMonth.set(true);
    setTimeout(() => {
      if (diff > 0) {
        this.nextMonth();
      } else {
        this.prevMonth();
      }
      this.animatingMonth.set(false);
    }, 150);
  }
}
