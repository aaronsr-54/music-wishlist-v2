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
import { WishlistShareService } from './wishlist-share.service';
import { ToastService } from '../../shared/components/toast/toast.component';
import { LanguageService } from '../i18n/language.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private shareService = inject(WishlistShareService);
  private toastService = inject(ToastService);
  private lang = inject(LanguageService);

  private _ownEntries = signal<WishlistEntry[]>([]);
  private _sharedEntries = signal<WishlistEntry[]>([]);

  entries = computed(() => {
    const visibleOwnerEmails = this.shareService
      .sharesReceived()
      .filter((share) => !share.hidden)
      .map((share) => share.ownerUid);

    const own = this._ownEntries().map((e) => ({ ...e, isOwner: true }));

    const shared = this._sharedEntries()
      .filter((e) => visibleOwnerEmails.includes(e.addedByUid))
      .map((e) => ({ ...e, isOwner: false }));

    return [...own, ...shared].sort(
      (a, b) => (b.addedAt || 0) - (a.addedAt || 0),
    );
  });

  pending = computed(() => this.entries().filter((e) => !e.downloaded));
  downloaded = computed(() => this.entries().filter((e) => e.downloaded));
  trackIds = computed(() => new Set(this.entries().map((e) => e.trackId)));
  total = computed(() => this.entries().length);

  private unsubscribe: (() => void)[] = [];
  private isDemoMode = false;

  initListener(uid: string, email: string): void {
    if (this.unsubscribe.length > 0) return;

    const auth = this.injector.get(AuthService);
    this.isDemoMode = auth.demoMode();

    if (this.isDemoMode) {
      this.initLocalStorage(uid);
      return;
    }

    runInInjectionContext(this.injector, () => {
      const col = collection(this.firestore, 'wishlist');

      const q1 = query(
        col,
        where('addedByUid', '==', uid),
        orderBy('addedAt', 'desc'),
      );

      const q2 = query(
        col,
        where('sharedWith', 'array-contains', email),
        orderBy('addedAt', 'desc'),
      );

      const unsubscribe1 = onSnapshot(q1, (snap1) => {
        const entries = snap1.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as WishlistEntry,
        );
        this._ownEntries.set(entries);
      });

      const unsubscribe2 = onSnapshot(q2, (snap2) => {
        const entries = snap2.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as WishlistEntry,
        );
        this._sharedEntries.set(entries);
      });

      this.unsubscribe = [unsubscribe1, unsubscribe2];
    });
  }

  private initLocalStorage(uid: string): void {
    const key = `wishlist-${uid}`;
    const stored = localStorage.getItem(key);
    const entries: WishlistEntry[] = stored ? JSON.parse(stored) : [];
    this._ownEntries.set(entries);
  }

  stopListener(): void {
    this.unsubscribe.forEach((fn) => fn());
    this.unsubscribe = [];
    this._ownEntries.set([]);
    this._sharedEntries.set([]);
  }

  async add(track: Track, user: User): Promise<void> {
    const sharedWithEmails = this.shareService
      .sharesGiven()
      .map((s) => s.recipientEmail);

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
      sharedWith: sharedWithEmails,
      ...(track.artistId ? { artistId: track.artistId } : {}),
    };

    try {
      if (this.isDemoMode) {
        const key = `wishlist-${user.uid}`;
        const current = this._ownEntries();
        const newEntry: WishlistEntry = { id: Date.now().toString(), ...entry };
        const updated = [newEntry, ...current];
        localStorage.setItem(key, JSON.stringify(updated));
        this._ownEntries.set(updated);
      } else {
        const col = collection(this.firestore, 'wishlist');
        await addDoc(col, entry);
      }
      this.toastService.success('Añadido a la wishlist');
    } catch {
      this.toastService.error('Ha ocurrido un error');
    }
  }

  async addRelease(release: ReleaseItem, user: User): Promise<void> {
    const sharedWithEmails = this.shareService
      .sharesGiven()
      .map((s) => s.recipientEmail);

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
      sharedWith: sharedWithEmails,
      ...(release.artistId ? { artistId: release.artistId } : {}),
    };

    try {
      if (this.isDemoMode) {
        const key = `wishlist-${user.uid}`;
        const current = this._ownEntries();
        const newEntry: WishlistEntry = { id: Date.now().toString(), ...entry };
        const updated = [newEntry, ...current];
        localStorage.setItem(key, JSON.stringify(updated));
        this._ownEntries.set(updated);
      } else {
        const col = collection(this.firestore, 'wishlist');
        await addDoc(col, entry);
      }
      this.toastService.success('Añadido a la wishlist');
    } catch {
      this.toastService.error('Ha ocurrido un error');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      if (this.isDemoMode) {
        const current = this._ownEntries();
        const updated = current.filter((e) => e.id !== id);
        this._ownEntries.set(updated);
        if (current.length > 0) {
          const uid = current[0].addedByUid;
          const key = `wishlist-${uid}`;
          localStorage.setItem(key, JSON.stringify(updated));
        }
      } else {
        await deleteDoc(doc(this.firestore, 'wishlist', id));
      }
      this.toastService.success('Eliminado de la wishlist');
    } catch {
      this.toastService.error('Ha ocurrido un error');
    }
  }

  async markDownloaded(id: string): Promise<void> {
    try {
      if (this.isDemoMode) {
        const current = this._ownEntries();
        const updated = current.map((e) =>
          e.id === id ? { ...e, downloaded: true } : e,
        );
        this._ownEntries.set(updated);
        if (current.length > 0) {
          const uid = current[0].addedByUid;
          const key = `wishlist-${uid}`;
          localStorage.setItem(key, JSON.stringify(updated));
        }
      } else {
        await updateDoc(doc(this.firestore, 'wishlist', id), { downloaded: true });
      }
      this.toastService.success('Marcado como listo');
    } catch {
      this.toastService.error('Ha ocurrido un error');
    }
  }

  async unmarkDownloaded(id: string): Promise<void> {
    try {
      if (this.isDemoMode) {
        const current = this._ownEntries();
        const updated = current.map((e) =>
          e.id === id ? { ...e, downloaded: false } : e,
        );
        this._ownEntries.set(updated);
        if (current.length > 0) {
          const uid = current[0].addedByUid;
          const key = `wishlist-${uid}`;
          localStorage.setItem(key, JSON.stringify(updated));
        }
      } else {
        await updateDoc(doc(this.firestore, 'wishlist', id), { downloaded: false });
      }
      this.toastService.success('Marcado como pendiente');
    } catch {
      this.toastService.error('Ha ocurrido un error');
    }
  }
}
