import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../core/api/search.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { AuthService } from '../../core/auth/auth.service';
import {
  PreviewService,
  TrackMetadata,
} from '../../core/services/preview.service';
import { AlbumTrack } from '../../shared/models/release-item.model';
import { CoverComponent } from '../../shared/components/cover/cover.component';
import { TypeChipComponent } from '../../shared/components/type-chip/type-chip.component';
import { SearchResultItemComponent } from '../../shared/components/search-result-item/search-result-item.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { LanguageService } from '../../core/i18n/language.service';
import { Track, TrackType } from '../../shared/models/track.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

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
    ButtonComponent,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  styles: `
    @keyframes popIn {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: scale(1);
      }
    }
    .btn-pop-in {
      animation: popIn 220ms var(--ease-smooth) both;
    }
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
      <app-page-header
        prefix="02/"
        [title]="album() ? t().album : t().album"
        [backLabel]="t().back"
        (back)="goBack()"
      />

      <div class="scroll-fade flex flex-col p-2 gap-12">
        @if (loading()) {
          <app-loading-spinner [message]="t().loadingSongs" />
        } @else if (album(); as a) {
          <div
            class="flex gap-2 max-md:flex-col max-md:items-center md:gap-8 max-md:text-center mt-4"
          >
            <div
              class="shrink-0 w-[200px] h-[200px] rounded-md overflow-hidden max-md:w-[150px] max-md:h-[150px] shadow-lg"
            >
              <app-cover [name]="a.name" [coverUrl]="a.coverUrl" [size]="200" />
            </div>

            <div class="flex-1 flex flex-col justify-start">
              <div class="flex flex-col text-ink dark:text-bone">
                <div
                  class="flex items-center gap-4 mb-2 md:mb-8 max-md:justify-center"
                >
                  <app-type-chip [type]="a.type" />
                </div>

                <div class="flex items-center justify-center gap-4">
                  <h1
                    class="m-0 text-[clamp(1.75rem,1.166rem+3.2389vw,3rem)] font-bold font-display md:flex-1"
                  >
                    {{ a.name }}
                  </h1>
                  <button
                    appBtn
                    variant="add"
                    [added]="isAlbumInWishlist()"
                    (click)="toggleWishlist()"
                  >
                    @if (isAlbumInWishlist()) {
                      <app-icon name="check" class="w-5 h-5 " />
                    } @else {
                      <app-icon name="plus" class="w-5 h-5 " />
                    }
                  </button>
                </div>

                <div class="flex items-center gap-2 max-md:justify-center">
                  @if (a.artistId) {
                    <a
                      class="text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] text-ink-700 dark:text-bone-700 hover:underline cursor-pointer"
                      (click)="goToArtist(a.artistId)"
                    >
                      {{ a.artist }}
                    </a>
                  } @else {
                    <span
                      class="text-[clamp(1rem,0.8957rem+0.4049vw,1.25rem)] text-ink-700 dark:text-bone-700"
                    >
                      {{ a.artist }}
                    </span>
                  }
                  <span class="text-ink-600 dark:text-bone-600">·</span>
                  <span
                    class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] text-ink-600 dark:text-bone-600"
                  >
                    {{ a.releaseDate | date: 'd MMM yyyy' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          @if (tracks().length > 0) {
            <div class="flex flex-col gap-4">
              <h2
                class="font-body text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink-700 dark:text-bone-700 font-semibold tracking-[0.05em] uppercase m-0"
              >
                {{ t().tracks }} ({{ tracks().length }})
              </h2>

              <div
                class="flex flex-col [&>*]:[animation:rowEnter_var(--dur-base)_var(--ease)_both]"
              >
                @for (track of trackList(); track track.id) {
                  <app-search-result-item
                    [item]="track"
                    type="track"
                    [isAdded]="isInWishlist(track.id)"
                    [showAddButton]="true"
                    [showTypeChip]="false"
                    [showTrackNumber]="true"
                    (onAddClick)="toggle($event)"
                    (onPlayClick)="onTrackPlayClicked($event)"
                  />
                }
              </div>
            </div>
          } @else {
            <div
              class="text-center py-10 px-5 text-ink-700 dark:text-bone-700 text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)]"
            >
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
    return this.tracks().map((t) => ({
      id: t.id,
      name: t.title,
      artists: albumData ? [albumData.artist] : [],
      coverUrl: albumData?.coverUrl || '',
      type: 'track' as TrackType,
      uri: '',
      previewUrl: t.previewUrl,
      trackNumber: t.trackNumber,
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
    return this.wishlistSvc.entries().some((e) => e.trackId === trackId);
  }

  isAlbumInWishlist(): boolean {
    const currentAlbum = this.album();
    if (!currentAlbum) return false;
    return this.wishlistSvc
      .entries()
      .some((e) => e.trackId === currentAlbum.id);
  }

  async toggleWishlist() {
    const currentAlbum = this.album();
    const user = this.authSvc.currentUser();
    if (!currentAlbum || !user) return;

    const existing = this.wishlistSvc
      .entries()
      .find((e) => e.trackId === currentAlbum.id);

    if (existing && existing.id) {
      await this.wishlistSvc.remove(existing.id);
    } else {
      await this.wishlistSvc.add(
        {
          id: currentAlbum.id,
          name: currentAlbum.name,
          artist: currentAlbum.artist,
          coverUrl: currentAlbum.coverUrl,
          type: currentAlbum.type,
        } as any,
        user,
      );
    }
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

  playPreview() {
    const currentAlbum = this.album();
    if (!currentAlbum) return;

    const playlist = this.buildPlaylist(currentAlbum);
    if (playlist.length === 0) return;

    this.previewSvc.play(playlist[0]);
  }

  onTrackPlayClicked(track: Track) {
    const currentAlbum = this.album();
    if (!currentAlbum) return;

    const playlist = this.buildPlaylist(currentAlbum);
    const idx = playlist.findIndex((p) => p.id === track.id);
  }

  private buildPlaylist(album: AlbumDetail): TrackMetadata[] {
    return this.tracks()
      .filter((t) => t.previewUrl)
      .map((t) => ({
        id: t.id,
        title: t.title,
        artist: album.artist,
        cover: album.coverUrl,
        previewUrl: t.previewUrl!,
        parentId: album.id,
      }));
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
