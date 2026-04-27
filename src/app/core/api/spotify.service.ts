import { Injectable } from '@angular/core';
import { Observable, forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Track, TrackType } from '../../shared/models/track.model';

const DEEZER = 'https://api.deezer.com';

@Injectable({ providedIn: 'root' })
export class SpotifyService {

  search(q: string): Observable<Track[]> {
    const term = encodeURIComponent(q);

    const songs$ = from(
      fetch(`${DEEZER}/search?q=${term}&limit=10`).then(r => r.json())
    );

    const albums$ = from(
      fetch(`${DEEZER}/search/album?q=${term}&limit=10`).then(r => r.json())
    );

    return forkJoin([songs$, albums$]).pipe(
      map(([songsRes, albumsRes]) => {
        const tracks: Track[] = (songsRes.data ?? []).map((t: any) => ({
          id: String(t.id),
          name: t.title,
          artists: [t.artist?.name ?? ''],
          coverUrl: t.album?.cover_big ?? t.album?.cover_medium ?? '',
          type: 'track' as TrackType,
          uri: t.link ?? ''
        }));

        const albums: Track[] = (albumsRes.data ?? []).map((a: any) => ({
          id: String(a.id),
          name: a.title,
          artists: [a.artist?.name ?? ''],
          coverUrl: a.cover_big ?? a.cover_medium ?? '',
          type: (a.record_type === 'single' ? 'ep' : 'album') as TrackType,
          uri: a.link ?? ''
        }));

        return [...tracks, ...albums];
      })
    );
  }
}
