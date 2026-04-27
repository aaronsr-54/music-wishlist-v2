import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of
} from 'rxjs';
import { Subscription } from 'rxjs';
import { SpotifyService } from '../../core/api/spotify.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { AuthService } from '../../core/auth/auth.service';
import { Track } from '../../shared/models/track.model';
import { CoverComponent } from '../../shared/components/cover/cover.component';
import { TypeChipComponent } from '../../shared/components/type-chip/type-chip.component';
import { SkeletonRowComponent } from '../../shared/components/skeleton-row/skeleton-row.component';

type SearchState = 'idle' | 'loading' | 'results' | 'empty';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, CoverComponent, TypeChipComponent, SkeletonRowComponent],
  template: `
    <div class="panel">
      <div class="eyebrow">
        <span class="eyebrow-label">01/ Buscador</span>
        <span class="eyebrow-sub">Spotify</span>
      </div>

      <div class="search-field" [class.has-value]="query()">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" stroke-width="1.5"/>
          <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
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
        >
        @if (query()) {
          <button class="clear-btn" (click)="clearQuery()" aria-label="Limpiar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        }
      </div>

      <div class="results">
        @switch (state()) {
          @case ('idle') {
            <div class="empty-state">
              <div class="empty-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="13" cy="13" r="8.5" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M19.5 19.5L26 26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <p class="empty-title">Empieza a escribir</p>
              <p class="empty-sub">Busca canciones o álbumes para añadirlos a tu wishlist</p>
            </div>
          }
          @case ('loading') {
            @for (_ of skeletons; track $index) {
              <app-skeleton-row [size]="56" />
            }
          }
          @case ('results') {
            @for (track of results(); track track.id) {
              <div class="item-row">
                <app-cover [coverUrl]="track.coverUrl" [name]="track.name" [size]="56" />
                <div class="item-meta">
                  <span class="item-title">{{ track.name }}</span>
                  <span class="item-artist">{{ track.artists[0] }}</span>
                  <app-type-chip [type]="track.type" />
                </div>
                <button
                  class="add-btn"
                  [class.added]="isAdded(track.id)"
                  (click)="toggle(track)"
                  [title]="isAdded(track.id) ? 'Quitar de wishlist' : 'Añadir a wishlist'"
                >
                  @if (isAdded(track.id)) {
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  }
                </button>
              </div>
            }
          }
          @case ('empty') {
            <div class="empty-state">
              <div class="dot-pulse empty-dots">
                <span></span><span></span><span></span>
              </div>
              <p class="empty-title">Sin resultados</p>
              <p class="empty-sub">Prueba con otro término de búsqueda</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .eyebrow {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 20px 20px 12px;
    }

    .eyebrow-label {
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 600;
      color: var(--bone);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .eyebrow-sub {
      font-family: var(--font-display);
      font-size: 12px;
      color: var(--bone-600);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .search-field {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 20px 4px;
      padding: 12px 16px;
      background: var(--ink-200);
      border-radius: var(--radius-card);
      border: 1.5px solid transparent;
      transition: border-color var(--dur-fast) var(--ease);
    }

    .search-field:focus-within {
      border-color: var(--bone-700);
      background: var(--ink-300);
    }

    .search-icon {
      color: var(--bone-700);
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--bone);
      font-family: var(--font-body);
      font-size: 18px;
      font-weight: 400;
    }

    .search-input::placeholder {
      color: var(--bone-700);
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

    .clear-btn:hover { color: var(--bone); }

    .results {
      flex: 1;
      overflow-y: auto;
      padding: 8px 20px 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon {
      color: var(--bone-700);
      margin-bottom: 4px;
    }

    .empty-title {
      font-family: var(--font-body);
      font-size: 16px;
      font-weight: 600;
      color: var(--bone);
      margin: 0;
    }

    .empty-sub {
      font-size: 13px;
      color: var(--bone-600);
      margin: 0;
      max-width: 240px;
    }

    .empty-dots {
      display: flex;
      gap: 6px;
      color: var(--bone-700);
      margin-bottom: 4px;
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 8px;
      border-bottom: 1px solid var(--ink-200);
      border-radius: var(--radius-md);
      margin: 0 -8px;
      transition: background var(--dur-fast) var(--ease);
    }

    .item-row:last-child { border-bottom: none; }

    .item-row:hover {
      background: var(--ink-200);
      border-bottom-color: transparent;
    }

    .item-row:hover + .item-row {
      border-top-color: transparent;
    }

    .item-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .item-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--bone);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-artist {
      font-size: 12px;
      color: var(--bone-600);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .add-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1.5px solid var(--ink-100);
      background: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--bone-600);
      flex-shrink: 0;
      transition: all var(--dur-fast) var(--ease);
    }

    .add-btn:hover {
      border-color: var(--bone-400);
      color: var(--bone);
    }

    .add-btn.added {
      background: var(--bone);
      border-color: var(--bone);
      color: var(--ink);
    }
  `]
})
export class SearchComponent implements OnInit, OnDestroy {
  private spotify = inject(SpotifyService);
  private wishlistSvc = inject(WishlistService);
  private authSvc = inject(AuthService);

  query = signal('');
  state = signal<SearchState>('idle');
  results = signal<Track[]>([]);

  skeletons = new Array(5);

  private search$ = new Subject<string>();
  private sub?: Subscription;

  ngOnInit() {
    this.sub = this.search$.pipe(
      debounceTime(220),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q.trim()) {
          this.state.set('idle');
          this.results.set([]);
          return of([]);
        }
        this.state.set('loading');
        return this.spotify.search(q).pipe(
          catchError(() => of([]))
        );
      })
    ).subscribe(res => {
      this.results.set(res);
      this.state.set(res.length ? 'results' : 'empty');
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onQuery(val: string) {
    this.query.set(val);
    if (!val.trim()) {
      this.state.set('idle');
      this.results.set([]);
    } else {
      this.state.set('loading');
    }
    this.search$.next(val);
  }

  clearQuery() {
    this.query.set('');
    this.state.set('idle');
    this.results.set([]);
    this.search$.next('');
  }

  isAdded(trackId: string): boolean {
    return this.wishlistSvc.trackIds().has(trackId);
  }

  async toggle(track: Track) {
    const entries = this.wishlistSvc.entries();
    const existing = entries.find(e => e.trackId === track.id);

    if (existing && existing.id) {
      await this.wishlistSvc.remove(existing.id);
    } else {
      const user = this.authSvc.currentUser();
      if (user) {
        await this.wishlistSvc.add(track, user);
      }
    }
  }
}
