import { Injectable } from '@angular/core';
import { Track } from '../../shared/models/track.model';
import { ReleaseItem } from '../../shared/models/release-item.model';

interface ArtistCacheEntry {
  artist: any;
  tracks: Track[];
  albums: ReleaseItem[];
  eps: ReleaseItem[];
  singles: ReleaseItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ArtistCacheService {
  private cache = new Map<string, ArtistCacheEntry>();

  get(artistId: string): ArtistCacheEntry | undefined {
    return this.cache.get(artistId);
  }

  set(artistId: string, data: ArtistCacheEntry): void {
    this.cache.set(artistId, data);
  }

  has(artistId: string): boolean {
    return this.cache.has(artistId);
  }

  clear(): void {
    this.cache.clear();
  }
}
