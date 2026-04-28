import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../core/api/search.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { AuthService } from '../../core/auth/auth.service';
import { Track } from '../../shared/models/track.model';
import { CoverComponent } from '../../shared/components/cover/cover.component';

@Component({
  selector: 'app-artist',
  standalone: true,
  imports: [CommonModule, CoverComponent],
  template: `
    <div class="artist-container">
      <button class="back-btn" (click)="goBack()" aria-label="Volver">
        ← Volver
      </button>

      <div class="artist-header">
        <div class="artist-cover">
          @if (artist(); as a) {
            <app-cover [name]="a.name" [coverUrl]="a.picture_big" />
          }
        </div>

        <div class="artist-info">
          @if (artist(); as a) {
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
        <h2>Canciones populares</h2>

        @if (loading()) {
          <div class="loading">Cargando canciones...</div>
        } @else if (tracks().length === 0) {
          <div class="empty">No hay canciones disponibles</div>
        } @else {
          <div class="tracks-list">
            @for (track of tracks(); track track.id) {
              <div class="track-item">
                <div class="track-cover">
                  <app-cover [name]="track.name" [coverUrl]="track.coverUrl" />
                </div>

                <div class="track-info">
                  <h3>{{ track.name }}</h3>
                  <p class="artist-name">
                    {{ track.artists.join(', ') }}
                  </p>
                </div>

                <div class="track-actions">
                  <button
                    class="wishlist-btn"
                    [class.active]="isInWishlist(track.id)"
                    (click)="toggle(track)"
                    [attr.aria-label]="
                      isInWishlist(track.id)
                        ? 'Remover de deseos'
                        : 'Agregar a deseos'
                    "
                  >
                    ♥
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        overflow-y: auto;
        background: var(--ink);
        color: var(--bone);
      }

      .artist-container {
        padding: 20px;
        max-width: 1000px;
        margin: 0 auto;
      }

      .back-btn {
        background: none;
        border: none;
        color: var(--bone-700);
        font-size: 14px;
        cursor: pointer;
        margin-bottom: 20px;
        padding: 8px 0;
        transition: color var(--dur-fast) var(--ease);
      }

      .back-btn:hover {
        color: var(--bone);
      }

      .artist-header {
        display: flex;
        gap: 30px;
        margin-bottom: 40px;
        padding-bottom: 40px;
        border-bottom: 1.5px solid var(--ink-100);
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
        font-size: 32px;
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
      }

      .deezer-link:hover {
        opacity: 0.8;
      }

      .tracks-section h2 {
        margin: 0 0 20px 0;
        font-size: 18px;
        font-weight: bold;
        font-family: var(--font-display);
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

      .track-item {
        display: flex;
        gap: 16px;
        padding: 12px;
        background: var(--ink-100);
        border-radius: var(--radius-sm);
        align-items: center;
        transition: background var(--dur-fast) var(--ease);
      }

      .track-item:hover {
        background: var(--ink-200);
      }

      .track-cover {
        flex-shrink: 0;
        width: 60px;
        height: 60px;
        border-radius: 4px;
        overflow: hidden;
      }

      .track-info {
        flex: 1;
        min-width: 0;
      }

      .track-info h3 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--bone);
      }

      .artist-name {
        margin: 0;
        font-size: 12px;
        color: var(--bone-700);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .track-actions {
        flex-shrink: 0;
      }

      .wishlist-btn {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 6px;
        color: var(--bone-700);
        transition: color var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
      }

      .wishlist-btn:hover {
        transform: scale(1.1);
      }

      .wishlist-btn.active {
        color: var(--accent-track);
      }

      @media (max-width: 768px) {
        .artist-container {
          padding: 16px;
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
          font-size: 24px;
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
