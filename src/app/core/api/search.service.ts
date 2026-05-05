import { Injectable, signal } from '@angular/core';
import { Observable, forkJoin, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Track, TrackType } from '../../shared/models/track.model';
import { ReleaseItem, AlbumTrack } from '../../shared/models/release-item.model';

interface SearchState {
  query: string;
  selectedTypes: Set<TrackType | 'artist'>;
  results: Track[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiUrl = 'https://music-wishlist-v2.vercel.app/api';
  private savedState = signal<SearchState | null>(null);

  search(q: string): Observable<Track[]> {
    const term = encodeURIComponent(q);
    const searchTerm = q.toLowerCase();

    const songs$ = from(
      fetch(`${this.apiUrl}/search?q=${term}`).then((r) => r.json()),
    );

    const albums$ = from(
      fetch(`${this.apiUrl}/search/album?q=${term}`).then((r) => r.json()),
    );

    const artists$ = from(
      fetch(`${this.apiUrl}/search/artist?q=${term}`).then((r) => r.json()),
    );

    return forkJoin([songs$, albums$, artists$]).pipe(
      map(([songsRes, albumsRes, artistsRes]) => {
        const tracks: Track[] = (songsRes.data ?? []).map((t: any) => ({
          id: String(t.id),
          name: t.title,
          artists: [t.artist?.name ?? ''],
          coverUrl: t.album?.cover_big ?? t.album?.cover_medium ?? '',
          type: 'track' as TrackType,
          uri: t.link ?? '',
          artistId: t.artist?.id,
          previewUrl: t.preview ? `/api/preview?url=${encodeURIComponent(t.preview)}` : undefined,
        }));

        const albums: Track[] = (albumsRes.data ?? []).map((a: any) => ({
          id: String(a.id),
          name: a.title,
          artists: [a.artist?.name ?? ''],
          coverUrl: a.cover_big ?? a.cover_medium ?? '',
          type: (a.record_type === 'single' ? 'ep' : 'album') as TrackType,
          uri: a.link ?? '',
          artistId: a.artist?.id,
        }));

        const artists: Track[] = (artistsRes.data ?? []).map((art: any) => ({
          id: String(art.id),
          name: art.name,
          artists: [art.name],
          coverUrl: art.picture_big ?? art.picture_medium ?? '',
          type: 'artist' as TrackType,
          uri: art.link ?? '',
          artistId: String(art.id),
          fanCount: art.nb_fan,
          albumCount: art.nb_album,
        }));

        const all = [...artists, ...albums, ...tracks].sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();

          const aExact = aName === searchTerm ? 0 : 1;
          const bExact = bName === searchTerm ? 0 : 1;
          if (aExact !== bExact) return aExact - bExact;

          const aStarts = aName.startsWith(searchTerm) ? 0 : 1;
          const bStarts = bName.startsWith(searchTerm) ? 0 : 1;
          if (aStarts !== bStarts) return aStarts - bStarts;

          const aIndex = aName.indexOf(searchTerm);
          const bIndex = bName.indexOf(searchTerm);
          return aIndex - bIndex;
        });

        return all;
      }),
    );
  }

  getArtistTracks(artistId: string): Observable<Track[]> {
    return from(
      fetch(`${this.apiUrl}/artist?id=${artistId}`).then((r) => r.json()),
    ).pipe(
      map((res: any) => {
        return (res.data ?? []).map((t: any) => ({
          id: String(t.id),
          name: t.title,
          artists: [t.artist?.name ?? ''],
          coverUrl: t.album?.cover_big ?? t.album?.cover_medium ?? '',
          type: 'track' as TrackType,
          uri: t.link ?? '',
          artistId: t.artist?.id,
          previewUrl: t.preview ? `/api/preview?url=${encodeURIComponent(t.preview)}` : undefined,
        }));
      }),
    );
  }

  getArtist(artistId: string): Observable<any> {
    return from(
      fetch(`${this.apiUrl}/artist-info?id=${artistId}`).then((r) => r.json()),
    );
  }

  getArtistReleases(
    artistId: string,
    artistName: string,
  ): Observable<ReleaseItem[]> {
    return from(
      fetch(`${this.apiUrl}/artist-albums?id=${artistId}`).then((r) =>
        r.json(),
      ),
    ).pipe(
      map((res: any): ReleaseItem[] =>
        (res.data ?? []).map((a: any) => ({
          id: String(a.id),
          name: a.title,
          artist: artistName ?? '',
          coverUrl: a.cover_big ?? a.cover_medium ?? '',
          type: (a.record_type === 'single' ? 'single' : 'album') as TrackType,
          releaseDate: a.release_date ?? '',
          previewUrl: undefined,
          artistId: a.artist?.id ? String(a.artist.id) : undefined,
        })),
      ),
      switchMap((releases: ReleaseItem[]) => {
        const singles = releases.filter((r) => r.type === 'single');
        if (singles.length === 0) return of(releases);

        const previewCalls = singles.map((s) =>
          from(
            fetch(`${this.apiUrl}/album-tracks?id=${s.id}`).then((r) =>
              r.json(),
            ),
          ).pipe(
            map((tracksRes: any) => ({
              id: s.id,
              previewUrl: tracksRes.data?.[0]?.preview
                ? `/api/preview?url=${encodeURIComponent(tracksRes.data[0].preview)}`
                : undefined,
            })),
            catchError(() => of({ id: s.id, previewUrl: undefined })),
          ),
        );

        return forkJoin(previewCalls).pipe(
          map((previews) => {
            const previewMap = new Map(previews.map((p) => [p.id, p.previewUrl]));
            return releases.map((r) => ({
              ...r,
              previewUrl: previewMap.get(r.id),
            }));
          }),
        );
      }),
    );
  }

  saveSearchState(
    query: string,
    selectedTypes: Set<TrackType | 'artist'>,
    results: Track[],
  ) {
    const state = { query, selectedTypes, results };
    this.savedState.set(state);
    sessionStorage.setItem(
      'searchState',
      JSON.stringify({
        query,
        selectedTypes: Array.from(selectedTypes),
        results,
      }),
    );
  }

  getSavedSearchState() {
    let state = this.savedState();
    if (!state) {
      const stored = sessionStorage.getItem('searchState');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          state = {
            query: parsed.query,
            selectedTypes: new Set(parsed.selectedTypes),
            results: parsed.results,
          };
          this.savedState.set(state);
        } catch {}
      }
    }
    return state;
  }

  clearSearchState() {
    this.savedState.set(null);
    sessionStorage.removeItem('searchState');
  }

  getTrackPreview(trackId: string): Observable<string | undefined> {
    return from(
      fetch(`${this.apiUrl}/track?id=${trackId}`).then((r) => r.json()),
    ).pipe(
      map((res: any) => {
        const previewUrl = res.preview;
        return previewUrl ? `/api/preview?url=${encodeURIComponent(previewUrl)}` : undefined;
      }),
      catchError(() => of(undefined)),
    );
  }

  getAlbumTracks(albumId: string): Observable<AlbumTrack[]> {
    return from(
      fetch(`${this.apiUrl}/album-tracks?id=${albumId}`).then((r) => r.json()),
    ).pipe(
      map((res: any) => {
        return (res.data ?? []).map((t: any, index: number) => ({
          id: String(t.id),
          title: t.title,
          duration: t.duration ?? 0,
          trackNumber: index + 1,
          previewUrl: t.preview
            ? `/api/preview?url=${encodeURIComponent(t.preview)}`
            : undefined,
        }));
      }),
      catchError(() => of([])),
    );
  }

  getAlbum(albumId: string): Observable<any> {
    return from(
      fetch(`${this.apiUrl}/album?id=${albumId}`).then((r) => r.json()),
    ).pipe(
      map((res: any) => ({
        id: String(res.id),
        name: res.title,
        artist: res.artist?.name ?? '',
        artistId: res.artist?.id ? String(res.artist.id) : undefined,
        coverUrl: res.cover_big ?? res.cover_medium ?? '',
        type: (res.record_type === 'ep' || res.record_type === 'single' ? 'ep' : 'album') as TrackType,
        releaseDate: res.release_date ?? '',
      })),
      catchError(() => of(null)),
    );
  }
}
