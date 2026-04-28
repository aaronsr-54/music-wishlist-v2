import { Injectable } from '@angular/core';
import { Observable, forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Track, TrackType } from '../../shared/models/track.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  search(q: string): Observable<Track[]> {
    const term = encodeURIComponent(q);

    const songs$ = from(
      fetch(`/api/search?q=${term}&type=track`).then((r) => r.json()),
    );

    const albums$ = from(
      fetch(`/api/search?q=${term}&type=album`).then((r) => r.json()),
    );

    const artists$ = from(
      fetch(`/api/search?q=${term}&type=artist`).then((r) => r.json()),
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
        }));

        return [...artists, ...tracks, ...albums];
      }),
    );
  }
}
