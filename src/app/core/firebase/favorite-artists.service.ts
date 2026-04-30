import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { SearchService } from '../api/search.service';

export interface FavoriteArtist {
  id?: string;
  artistId: string;
  name: string;
  image?: string;
  addedAt: number;
  addedBy: string;
  addedByUid: string;
}

@Injectable({ providedIn: 'root' })
export class FavoriteArtistsService {
  private firestore = inject(Firestore);
  private search = inject(SearchService);

  private _artists = signal<FavoriteArtist[]>([]);
  artists = this._artists.asReadonly();

  artistIds = computed(() => new Set(this._artists().map((a) => a.artistId)));

  private unsubscribe: (() => void) | null = null;

  initListener(): void {
    if (this.unsubscribe) return;

    const col = collection(this.firestore, 'favorite-artists');
    const q = query(col, orderBy('addedAt', 'desc'));

    this.unsubscribe = onSnapshot(q, async (snap) => {
      let artists = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as FavoriteArtist,
      );

      // Enriquecer artistas sin image
      artists = await Promise.all(
        artists.map(async (artist) => {
          if (!artist.image || !artist.image.trim()) {
            try {
              const data = await this.search.getArtist(artist.artistId).toPromise();
              return {
                ...artist,
                image: data?.picture_big ?? data?.picture_medium ?? artist.image,
              };
            } catch {
              return artist;
            }
          }
          return artist;
        })
      );

      this._artists.set(artists);
    });
  }

  stopListener(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  async add(artistId: string, artistName: string, image: string | undefined, user: User): Promise<void> {
    const entry: Omit<FavoriteArtist, 'id'> = {
      artistId,
      name: artistName,
      image,
      addedAt: Date.now(),
      addedBy: user.displayName ?? user.email ?? 'Anónimo',
      addedByUid: user.uid,
    };

    const col = collection(this.firestore, 'favorite-artists');
    await addDoc(col, entry);
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'favorite-artists', id));
  }
}
