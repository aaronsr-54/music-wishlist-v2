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
  orderBy
} from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { Track } from '../../shared/models/track.model';
import { WishlistEntry } from '../../shared/models/wishlist-entry.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private firestore = inject(Firestore);

  private _entries = signal<WishlistEntry[]>([]);
  entries = this._entries.asReadonly();

  pending = computed(() => this._entries().filter(e => !e.downloaded));
  downloaded = computed(() => this._entries().filter(e => e.downloaded));
  trackIds = computed(() => new Set(this._entries().map(e => e.trackId)));
  total = computed(() => this._entries().length);

  private unsubscribe: (() => void) | null = null;

  constructor() {}

  initListener(): void {
    if (this.unsubscribe) return;

    const col = collection(this.firestore, 'wishlist');
    const q = query(col, orderBy('addedAt', 'desc'));

    this.unsubscribe = onSnapshot(q, snap => {
      this._entries.set(
        snap.docs.map(d => ({ id: d.id, ...d.data() } as WishlistEntry))
      );
    });
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
      downloaded: false
    };

    const col = collection(this.firestore, 'wishlist');
    await addDoc(col, entry);
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'wishlist', id));
  }

  async markDownloaded(id: string): Promise<void> {
    await updateDoc(doc(this.firestore, 'wishlist', id), { downloaded: true });
  }

  async unmarkDownloaded(id: string): Promise<void> {
    await updateDoc(doc(this.firestore, 'wishlist', id), { downloaded: false });
  }
}
