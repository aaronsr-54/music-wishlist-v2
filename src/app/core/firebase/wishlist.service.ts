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
  private injector = inject(Injector);

  private _entries = signal<(WishlistEntry & { isOwner: boolean })[]>([]);
  entries = this._entries.asReadonly();

  pending = computed(() => this._entries().filter((e) => !e.downloaded));
  downloaded = computed(() => this._entries().filter((e) => e.downloaded));
  trackIds = computed(() => new Set(this._entries().map((e) => e.trackId)));
  total = computed(() => this._entries().length);

  private unsubscribe: (() => void)[] = [];
  private isDemoMode = false;

  initListener(uid: string): void {
    if (this.unsubscribe.length > 0) return;

    runInInjectionContext(this.injector, () => {
      const auth = inject(AuthService);
      this.isDemoMode = auth.demoMode();
    });

    if (this.isDemoMode) {
      this.initLocalStorage(uid);
      return;
    }

    const col = collection(this.firestore, 'wishlist');

    // Query 1: Own wishlist
    const q1 = query(
      col,
      where('addedByUid', '==', uid),
      orderBy('addedAt', 'desc'),
    );

    // Query 2: Shared with me
    const q2 = query(
      col,
      where('sharedWith', 'array-contains', uid),
      orderBy('addedAt', 'desc'),
    );

    const unsubscribe1 = onSnapshot(q1, (snap1) => {
      const entries1 = snap1.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as WishlistEntry,
      );
      this.updateEntries(uid, entries1, 'own');
    });

    const unsubscribe2 = onSnapshot(q2, (snap2) => {
      const entries2 = snap2.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as WishlistEntry,
      );
      this.updateEntries(uid, entries2, 'shared');
    });

    this.unsubscribe = [unsubscribe1, unsubscribe2];
  }

  private ownEntries: (WishlistEntry & { isOwner: boolean })[] = [];
  private sharedEntries: (WishlistEntry & { isOwner: boolean })[] = [];

  private updateEntries(
    uid: string,
    entries: WishlistEntry[],
    type: 'own' | 'shared',
  ): void {
    const marked = entries.map((e) => ({
      ...e,
      isOwner: type === 'own',
    }));

    if (type === 'own') {
      this.ownEntries = marked as any;
    } else {
      this.sharedEntries = marked as any;
    }

    const combined = [...this.ownEntries, ...this.sharedEntries].sort(
      (a, b) => (b.addedAt || 0) - (a.addedAt || 0),
    );
    this._entries.set(combined);
  }

  private initLocalStorage(uid: string): void {
    const key = `wishlist-${uid}`;
    const stored = localStorage.getItem(key);
    const entries: WishlistEntry[] = stored ? JSON.parse(stored) : [];
    const marked = entries.map((e) => ({ ...e, isOwner: true }));
    this._entries.set(marked as any);
    this.ownEntries = marked as any;
  }

  stopListener(): void {
    this.unsubscribe.forEach((fn) => fn());
    this.unsubscribe = [];
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
      ...(track.artistId ? { artistId: track.artistId } : {}),
    };

    if (this.isDemoMode) {
      const key = `wishlist-${user.uid}`;
      const stored = localStorage.getItem(key);
      const entries: WishlistEntry[] = stored ? JSON.parse(stored) : [];
      const newEntry: WishlistEntry = { id: Date.now().toString(), ...entry };
      entries.unshift(newEntry);
      localStorage.setItem(key, JSON.stringify(entries));
      const marked = entries.map((e) => ({ ...e, isOwner: true }));
      this._entries.set(marked as any);
      this.ownEntries = marked as any;
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
      ...(release.artistId ? { artistId: release.artistId } : {}),
    };

    if (this.isDemoMode) {
      const key = `wishlist-${user.uid}`;
      const stored = localStorage.getItem(key);
      const entries: WishlistEntry[] = stored ? JSON.parse(stored) : [];
      const newEntry: WishlistEntry = { id: Date.now().toString(), ...entry };
      entries.unshift(newEntry);
      localStorage.setItem(key, JSON.stringify(entries));
      const marked = entries.map((e) => ({ ...e, isOwner: true }));
      this._entries.set(marked as any);
      this.ownEntries = marked as any;
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
