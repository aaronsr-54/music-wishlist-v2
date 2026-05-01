import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
} from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { Track } from '../../shared/models/track.model';
import { WishlistEntry } from '../../shared/models/wishlist-entry.model';
import { ReleaseItem } from '../../shared/models/release-item.model';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private firestore = inject(Firestore);

  private _entries = signal<WishlistEntry[]>([]);
  entries = this._entries.asReadonly();

  pending = computed(() => this._entries().filter((e) => !e.downloaded));
  downloaded = computed(() => this._entries().filter((e) => e.downloaded));
  trackIds = computed(() => new Set(this._entries().map((e) => e.trackId)));
  total = computed(() => this._entries().length);

  private unsubscribe: (() => void) | null = null;
  private isDemoMode = false;

  initListener(uid: string): void {
    if (this.unsubscribe) return;

    // Lazy inject to avoid circular dependency
    const auth = inject(AuthService);
    this.isDemoMode = auth.demoMode();

    if (this.isDemoMode) {
      this.initLocalStorage(uid);
      return;
    }

    const col = collection(this.firestore, 'wishlist');
    const q = query(
      col,
      where('addedByUid', '==', uid),
      orderBy('addedAt', 'desc')
    );

    this.unsubscribe = onSnapshot(q, (snap) => {
      const entries = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as WishlistEntry,
      );
      this._entries.set(entries);
    });
  }

  private initLocalStorage(uid: string): void {
    const key = `wishlist-${uid}`;
    const stored = localStorage.getItem(key);
    const entries: WishlistEntry[] = stored ? JSON.parse(stored) : [];
    this._entries.set(entries);
  }

  stopListener(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  async add(track: Track, user: User): Promise<void> {
    const entry: Omit<WishlistEntry, 'id'> = {
      trackId: track.id,
      name: track.name,
      artist: track.artists[0] ?? '',
      coverUrl: track.coverUrl,
      type: track.type,
      addedAt: Date.now(),
      addedBy: user.displayName ?? user.email ?? 'Anónimo',
      addedByUid: user.uid,
      downloaded: false,
      ...(track.previewUrl ? { previewUrl: track.previewUrl } : {}),
    };

    if (this.isDemoMode) {
      const key = `wishlist-${user.uid}`;
      const stored = localStorage.getItem(key);
      const entries: WishlistEntry[] = stored ? JSON.parse(stored) : [];
      const newEntry: WishlistEntry = { id: Date.now().toString(), ...entry };
      entries.unshift(newEntry);
      localStorage.setItem(key, JSON.stringify(entries));
      this._entries.set(entries);
      return;
    }

    const col = collection(this.firestore, 'wishlist');
    await addDoc(col, entry);
  }

  async addRelease(release: ReleaseItem, user: User): Promise<void> {
    const entry: Omit<WishlistEntry, 'id'> = {
      trackId: release.id,
      name: release.name,
      artist: release.artist,
      coverUrl: release.coverUrl,
      type: release.type,
      addedAt: Date.now(),
      addedBy: user.displayName ?? user.email ?? 'Anónimo',
      addedByUid: user.uid,
      downloaded: false,
      ...(release.previewUrl ? { previewUrl: release.previewUrl } : {}),
    };

    if (this.isDemoMode) {
      const key = `wishlist-${user.uid}`;
      const stored = localStorage.getItem(key);
      const entries: WishlistEntry[] = stored ? JSON.parse(stored) : [];
      const newEntry: WishlistEntry = { id: Date.now().toString(), ...entry };
      entries.unshift(newEntry);
      localStorage.setItem(key, JSON.stringify(entries));
      this._entries.set(entries);
      return;
    }

    const col = collection(this.firestore, 'wishlist');
    await addDoc(col, entry);
  }

  async remove(id: string): Promise<void> {
    if (this.isDemoMode) {
      const current = this._entries();
      const updated = current.filter((e) => e.id !== id);
      this._entries.set(updated);
      if (current.length > 0) {
        const uid = current[0].addedByUid;
        const key = `wishlist-${uid}`;
        localStorage.setItem(key, JSON.stringify(updated));
      }
      return;
    }

    await deleteDoc(doc(this.firestore, 'wishlist', id));
  }

  async markDownloaded(id: string): Promise<void> {
    if (this.isDemoMode) {
      const current = this._entries();
      const updated = current.map((e) =>
        e.id === id ? { ...e, downloaded: true } : e,
      );
      this._entries.set(updated);
      if (current.length > 0) {
        const uid = current[0].addedByUid;
        const key = `wishlist-${uid}`;
        localStorage.setItem(key, JSON.stringify(updated));
      }
      return;
    }

    await updateDoc(doc(this.firestore, 'wishlist', id), { downloaded: true });
  }

  async unmarkDownloaded(id: string): Promise<void> {
    if (this.isDemoMode) {
      const current = this._entries();
      const updated = current.map((e) =>
        e.id === id ? { ...e, downloaded: false } : e,
      );
      this._entries.set(updated);
      if (current.length > 0) {
        const uid = current[0].addedByUid;
        const key = `wishlist-${uid}`;
        localStorage.setItem(key, JSON.stringify(updated));
      }
      return;
    }

    await updateDoc(doc(this.firestore, 'wishlist', id), { downloaded: false });
  }
}
