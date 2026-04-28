import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../core/api/search.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { AuthService } from '../../core/auth/auth.service';
import { Track } from '../../shared/models/track.model';
import { CoverComponent } from '../../shared/components/cover/cover.component';
import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';

@Component({
  selector: 'app-artist',
  standalone: true,
  imports: [CommonModule, CoverComponent, SearchResultItemComponent],
  template: `
    <div class="panel">
      <div class="eyebrow">
        <button class="back-btn" (click)="goBack()" aria-label="Volver">
          ← Volver
        </button>
        <span class="label"
          ><span class="label--number">01.a/</span> ARTISTA</span
        >
      </div>

      <div class="artist-container">
        <div class="artist-header">
          <div class="artist-cover">
            @if (artist(); as a) {
              <app-cover
                [name]="a.name"
                [coverUrl]="a.picture_big"
                [size]="200"
              />
            }
          </div>

          <div class="artist-info">
            @if (artist(); as a) {
              <div class="artist-info artist-info--header">
                <h1>{{ a.name }}</h1>

                <div class="artist-stats">
                  @if (a.nb_fan !== undefined) {
                    <div class="stat">
                      <span class="stat-label">Seguidores</span>
                      <span class="stat-value">{{ formatFans(a.nb_fan) }}</span>
                    </div>
                  }

                  @if (a.nb_album !== undefined) {
                    <div class="stat">
                      <span class="stat-label">Álbumes</span>
                      <span class="stat-value">{{ a.nb_album }}</span>
                    </div>
                  }
                </div>
              </div>

              @if (a.link) {
                <a
                  [href]="a.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="deezer-link"
                >
                  Ver en Deezer
                </a>
              }
            }
          </div>
        </div>

        <div class="tracks-section">
          <h2 class="section-title">Canciones populares</h2>

          @if (loading()) {
            <div class="loading">Cargando canciones...</div>
          } @else if (tracks().length === 0) {
            <div class="empty">No hay canciones disponibles</div>
          } @else {
            <div class="tracks-list">
              @for (track of tracks(); track track.id) {
                <app-search-result-item
                  class="result-item"
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

      .artist-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0.5rem 1rem;
        gap: 2rem;
        overflow: auto;
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

      .eyebrow-sub {
        font-family: var(--font-display);
        font-size: 12px;
        color: var(--bone-700);
        letter-spacing: 0.06em;
        font-style: italic;
      }

      .back-btn {
        background: none;
        border: none;
        color: var(--bone-700);
        font-size: 14px;
        cursor: pointer;
        transition: color var(--dur-fast) var(--ease);
      }

      .back-btn:hover {
        color: var(--bone);
      }

      .artist-header {
        display: flex;
        gap: 30px;
      }

      .artist-cover {
        flex-shrink: 0;
        width: 200px;
        height: 200px;
        border-radius: var(--radius-md);
        overflow: hidden;
      }

      .artist-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
      }

      .artist-info h1 {
        margin: 0 0 20px 0;
        font-size: 4rem;
        font-weight: bold;
        font-family: var(--font-display);
      }

      .artist-stats {
        display: flex;
        gap: 30px;
        margin-bottom: 20px;
      }

      .stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .stat-label {
        font-size: 12px;
        color: var(--bone-700);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-family: var(--font-display);
        font-style: italic;
      }

      .stat-value {
        font-size: 18px;
        font-weight: bold;
      }

      .deezer-link {
        display: inline-block;
        padding: 10px 20px;
        background: var(--accent-track);
        color: var(--ink);
        border-radius: var(--radius-sm);
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        transition: opacity var(--dur-fast) var(--ease);

        @media (min-width: 769px) {
          width: fit-content;
        }
      }

      .deezer-link:hover {
        opacity: 0.8;
      }

      .tracks-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .section-title {
        font-family: var(--font-body);
        font-size: 12px;
        color: var(--bone-700);
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        padding: 8px 8px 0;
        margin: 0;
      }

      .loading,
      .empty {
        text-align: center;
        padding: 40px 20px;
        color: var(--bone-700);
        font-size: 14px;
      }

      .tracks-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      @media (max-width: 768px) {
        .artist-container {
          padding: 1rem 0;
        }

        .artist-header {
          flex-direction: column;
          align-items: center;
          gap: 20px;
          text-align: center;
        }

        .artist-cover {
          width: 150px;
          height: 150px;
        }

        .artist-info h1 {
          font-size: 2rem;
        }

        .artist-stats {
          justify-content: center;
        }
      }
    `,
  ],
})
export class ArtistComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchSvc = inject(SearchService);
  private wishlistSvc = inject(WishlistService);
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

  goBack() {
    this.router.navigate(['']);
  }

  formatFans(count: number): string {
    if (count >= 1000000)
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (count >= 1000)
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return count.toString();
  }
}
