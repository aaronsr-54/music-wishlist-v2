import {
  Injectable,
  computed,
  inject,
  signal,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
} from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { SearchService } from '../api/search.service';
import { AuthService } from '../auth/auth.service';

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
  private injector = inject(Injector);

  private _artists = signal<FavoriteArtist[]>([]);
  artists = this._artists.asReadonly();

  artistIds = computed(() => new Set(this._artists().map((a) => a.artistId)));

  private unsubscribe: (() => void) | null = null;
  private isDemoMode = false;

  initListener(uid: string): void {
    if (this.unsubscribe) return;

    // Ejecutamos todo dentro del contexto de inyección para que Firebase esté "seguro"
    runInInjectionContext(this.injector, () => {
      // Obtenemos AuthService aquí para evitar la dependencia circular (NG0200)
      const auth = inject(AuthService);
      this.isDemoMode = auth.demoMode();

      if (this.isDemoMode) {
        this.initLocalStorage(uid);
        return;
      }

      // Referencias de Firebase dentro del contexto
      const col = collection(this.firestore, 'favorite-artists');
      const q = query(
        col,
        where('addedByUid', '==', uid),
        orderBy('addedAt', 'desc'),
      );

      this.unsubscribe = onSnapshot(q, async (snap) => {
        let artists = snap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as FavoriteArtist,
        );

        // Enriquecer artistas sin imagen
        artists = await Promise.all(
          artists.map(async (artist) => {
            if (!artist.image || !artist.image.trim()) {
              try {
                // Usamos toPromise() como en tu código original
                const data = await this.search
                  .getArtist(artist.artistId)
                  .toPromise();
                return {
                  ...artist,
                  image:
                    data?.picture_big ?? data?.picture_medium ?? artist.image,
                };
              } catch {
                return artist;
              }
            }
            return artist;
          }),
        );

        this._artists.set(artists);
      });
    });
  }

  private initLocalStorage(uid: string): void {
    const key = `favorite-artists-${uid}`;
    const stored = localStorage.getItem(key);
    const artists: FavoriteArtist[] = stored ? JSON.parse(stored) : [];
    this._artists.set(artists);
  }

  stopListener(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this._artists.set([]);
  }

  async add(
    artistId: string,
    artistName: string,
    image: string | undefined,
    user: User,
  ): Promise<void> {
    const entry: Omit<FavoriteArtist, 'id'> = {
      artistId,
      name: artistName,
      image,
      addedAt: Date.now(),
      addedBy: user.displayName ?? user.email ?? 'Anónimo',
      addedByUid: user.uid,
    };

    if (this.isDemoMode) {
      const key = `favorite-artists-${user.uid}`;
      const stored = localStorage.getItem(key);
      const artists: FavoriteArtist[] = stored ? JSON.parse(stored) : [];
      const newArtist: FavoriteArtist = { id: Date.now().toString(), ...entry };
      artists.unshift(newArtist);
      localStorage.setItem(key, JSON.stringify(artists));
      this._artists.set(artists);
      return;
    }

    // Envolvemos addDoc en el contexto para evitar el warning
    return runInInjectionContext(this.injector, () => {
      const col = collection(this.firestore, 'favorite-artists');
      return addDoc(col, entry).then(() => {});
    });
  }

  async remove(id: string): Promise<void> {
    if (this.isDemoMode) {
      const current = this._artists();
      const updated = current.filter((a) => a.id !== id);
      this._artists.set(updated);

      if (updated.length >= 0) {
        // Obtenemos el UID de los argumentos o del estado si es necesario
        // Aquí asumimos que el estado actual tiene la info
        const storedUid = localStorage.getItem('last_uid') || '';
        const key = `favorite-artists-${storedUid}`;
        localStorage.setItem(key, JSON.stringify(updated));
      }
      return;
    }

    // Envolvemos deleteDoc en el contexto para evitar el warning
    return runInInjectionContext(this.injector, () => {
      const docRef = doc(this.firestore, 'favorite-artists', id);
      return deleteDoc(docRef);
    });
  }
}
