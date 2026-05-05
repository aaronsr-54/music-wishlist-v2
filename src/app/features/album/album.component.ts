import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../core/api/search.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { AuthService } from '../../core/auth/auth.service';
import { PreviewService } from '../../core/services/preview.service';
import { AlbumTrack, ReleaseItem } from '../../shared/models/release-item.model';
import { CoverComponent } from '../../shared/components/cover/cover.component';
import { TypeChipComponent } from '../../shared/components/type-chip/type-chip.component';
import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { LanguageService } from '../../core/i18n/language.service';
import { Track, TrackType } from '../../shared/models/track.model';

interface AlbumDetail {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  coverUrl: string;
  type: TrackType;
  releaseDate: string;
}

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [
    CommonModule,
    CoverComponent,
    TypeChipComponent,
    SearchResultItemComponent,
    SpinnerComponent,
    IconComponent,
  ],
  styles: `
    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.8); }
      50% { opacity: 1; }
      100% { transform: scale(1); }
    }
    .btn-pop-in { animation: popIn 220ms var(--ease-smooth) both; }
    .scroll-fade {
      flex: 1;
      overflow-y: auto;
      scrollbar-width: none;
      padding-bottom: 2rem;
      padding-top: 4px;
      -webkit-mask-image: linear-gradient(
        to bottom, transparent 0%, black 16px, black 95%, transparent 100%
      );
      mask-image: linear-gradient(
        to bottom, transparent 0%, black 16px, black 95%, transparent 100%
      );
    }
    .scroll-fade::-webkit-scrollbar { display: none; }
  `,
  template: `
    <div class="flex flex-col h-full overflow-hidden p-0.5 pt-2 gap-4">
      <div class="flex items-center justify-between gap-2">
        <button
          class="bg-transparent text-ink-700 dark:text-bone-700 text-md cursor-pointer transition-colors duration-fast hover:text-ink dark:hover:text-bone lowercase"
          (click)="goBack()"
          [aria-label]="t().back"
        >
          ← {{ t().back }}
        </button>
        <span class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink dark:text-bone font-bold tracking-[0.06em]">
          <span class="text-ink-700 dark:text-bone-700 font-normal italic">02.a/</span>
          {{ album() ? t().album : t().album }}
        </span>
      </div>

      <div class="scroll-fade flex flex-col p-4 py-2 gap-6">
        @if (loading()) {
          <div class="flex flex-col items-center gap-4 py-10 px-5 text-ink-600 dark:text-bone-600 text-center">
            <app-spinner size="md" />
            <span class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] italic">{{ t().loadingSongs }}</span>
          </div>
        } @else if (album(); as a) {
          <div class="flex gap-2 max-md:flex-col max-md:items-center md:gap-8 max-md:text-center mt-4">
            <div class="shrink-0 w-[200px] h-[200px] rounded-md overflow-hidden max-md:w-[150px] max-md:h-[150px] shadow-lg">
              <app-cover [name]="a.name" [coverUrl]="a.coverUrl" [size]="200" />
            </div>

            <div class="flex-1 flex flex-col justify-start">
              <div class="flex flex-col text-ink dark:text-bone">
                <div class="flex items-center gap-4 mb-3 max-md:justify-center">
                  <app-type-chip [type]="a.type" />
                </div>

                <h1 class="m-0 text-[clamp(1.75rem,1.166rem+3.2389vw,3rem)] font-bold font-display mb-2">
                  {{ a.name }}
                </h1>

                <div class="flex items-center gap-2 mb-4 max-md:justify-center">
                  @if (a.artistId) {
                    <a
                      class="text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] text-ink-700 dark:text-bone-700 hover:underline cursor-pointer"
                      (click)="goToArtist(a.artistId)"
                    >
                      {{ a.artist }}
                    </a>
                  } @else {
                    <span class="text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] text-ink-700 dark:text-bone-700">
                      {{ a.artist }}
                    </span>
                  }
                  <span class="text-ink-600 dark:text-bone-600">·</span>
                  <span class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] text-ink-600 dark:text-bone-600">
                    {{ a.releaseDate | date: 'd MMM yyyy' }}
                  </span>
                </div>

                <div class="flex gap-3 max-md:justify-center">
                  <button
                    class="flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-bone font-semibold text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] transition-transform duration-fast hover:scale-[1.02] active:scale-[0.98]"
                    (click)="playPreview()"
                    [title]="t().playPreview"
                  >
                    <app-icon name="play" class="w-5 h-5" />
                    {{ t().play }}
                  </button>

                  <button
                    class="[&.added]:btn-pop-in w-10 h-10 rounded-full cursor-pointer flex items-center justify-center text-ink-600 dark:text-bone-600 shrink-0 border border-ink-400 dark:border-bone-400 transition-[color,transform] duration-fast ease-smooth hover:scale-[1.05] active:scale-[0.88]"
                    [class.added]="isAlbumInWishlist()"
                    (click)="toggleWishlist()"
                    [title]="isAlbumInWishlist() ? t().removeFromWishlist : t().addToWishlist"
                  >
                    @if (isAlbumInWishlist()) {
                      <app-icon name="check" class="w-5 h-5" />
                    } @else {
                      <app-icon name="plus" class="w-5 h-5" />
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>

          @if (tracks().length > 0) {
            <div class="flex flex-col gap-4">
              <h2 class="font-body text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink-700 dark:text-bone-700 font-semibold tracking-[0.05em] uppercase m-0">
                {{ t().tracks }} ({{ tracks().length }})
              </h2>

              <div class="flex flex-col [&>*]:[animation:rowEnter_var(--dur-base)_var(--ease)_both]">
                @for (track of trackList(); track track.id) {
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
            </div>
          } @else {
            <div class="text-center py-10 px-5 text-ink-700 dark:text-bone-700 text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)]">
              {{ t().noSongsAvailable }}
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class AlbumComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchSvc = inject(SearchService);
  private wishlistSvc = inject(WishlistService);
  private authSvc = inject(AuthService);
  private previewSvc = inject(PreviewService);
  private languageService = inject(LanguageService);

  t = computed(() => this.languageService.t());
  previewState = computed(() => this.previewSvc.state());

  album = signal<AlbumDetail | null>(null);
  tracks = signal<AlbumTrack[]>([]);
  loading = signal(true);

  trackList = computed(() => {
    const albumData = this.album();
    return this.tracks().map(t => ({
      id: t.id,
      name: t.title,
      artists: albumData ? [albumData.artist] : [],
      coverUrl: albumData?.coverUrl || '',
      type: 'track' as TrackType,
      uri: '',
      previewUrl: t.previewUrl,
    }));
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const albumId = params.get('id');
      if (albumId) {
        this.loadAlbum(albumId);
      }
    });
  }

  private loadAlbum(albumId: string) {
    this.loading.set(true);

    this.searchSvc.getAlbum(albumId).subscribe({
      next: (albumData) => {
        if (albumData) {
          this.album.set(albumData);
        }
      },
    });

    this.searchSvc.getAlbumTracks(albumId).subscribe({
      next: (tracks) => {
        this.tracks.set(tracks);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  isInWishlist(trackId: string): boolean {
    return this.wishlistSvc.entries().some(e => e.trackId === trackId);
  }

  isAlbumInWishlist(): boolean {
    const currentAlbum = this.album();
    if (!currentAlbum) return false;
    return this.wishlistSvc.entries().some(
      e => e.trackId === currentAlbum.id
    );
  }

  async toggleWishlist() {
    const currentAlbum = this.album();
    const user = this.authSvc.currentUser();
    if (!currentAlbum || !user) return;

    const existing = this.wishlistSvc.entries().find(
      e => e.trackId === currentAlbum.id
    );

    if (existing && existing.id) {
      await this.wishlistSvc.remove(existing.id);
    } else {
      await this.wishlistSvc.add({
        id: currentAlbum.id,
        name: currentAlbum.name,
        artist: currentAlbum.artist,
        coverUrl: currentAlbum.coverUrl,
        type: currentAlbum.type,
      } as any, user);
    }
  }

  async toggle(track: any) {
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

  playPreview() {
    const currentAlbum = this.album();
    if (currentAlbum) {
      this.previewSvc.playAlbum(currentAlbum);
    }
  }

  onPlayTrack(track: AlbumTrack) {
    const currentAlbum = this.album();
    if (!currentAlbum || !track.previewUrl) return;

    this.previewSvc.play({
      id: track.id,
      title: track.title,
      artist: currentAlbum.artist,
      cover: currentAlbum.coverUrl,
      previewUrl: track.previewUrl,
      parentId: currentAlbum.id,
    });

    const playlist = this.tracks()
      .filter(t => t.previewUrl)
      .map((t, idx) => ({
        id: t.id,
        title: t.title,
        artist: currentAlbum.artist,
        cover: currentAlbum.coverUrl,
        previewUrl: t.previewUrl!,
        parentId: currentAlbum.id,
      }));

    const currentIndex = playlist.findIndex(p => p.id === track.id);
    if (currentIndex >= 0) {
      this.previewSvc.setPlaylist(playlist, currentIndex);
    }
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  goBack() {
    this.router.navigate(['']);
  }

  goToArtist(artistId: string | undefined) {
    if (artistId) {
      this.router.navigate(['/artist', artistId]);
    }
  }
}