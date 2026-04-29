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

  private _artists = signal<FavoriteArtist[]>([]);
  artists = this._artists.asReadonly();

  artistIds = computed(() => new Set(this._artists().map((a) => a.artistId)));

  private unsubscribe: (() => void) | null = null;

  initListener(): void {
    if (this.unsubscribe) return;

    const col = collection(this.firestore, 'favorite-artists');
    const q = query(col, orderBy('addedAt', 'desc'));

    this.unsubscribe = onSnapshot(q, (snap) => {
      const artists = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as FavoriteArtist,
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
