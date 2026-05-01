import { Injectable, inject, signal, computed, effect } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
} from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { WishlistInvite } from '../../shared/models/wishlist-invite.model';

@Injectable({ providedIn: 'root' })
export class WishlistInviteService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  private _invites = signal<WishlistInvite[]>([]);
  invites = this._invites.asReadonly();

  pending = computed(() =>
    this._invites().filter((i) => i.status === 'pending')
  );

  private unsubscribe: (() => void) | null = null;

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.initListener(user.uid);
      } else {
        this.stopListener();
      }
    });
  }

  private initListener(uid: string): void {
    if (this.unsubscribe) return;

    const col = collection(this.firestore, 'wishlist-invites');
    const q = query(
      col,
      where('invitedEmail', '==', this.auth.currentUser()?.email),
      orderBy('createdAt', 'desc')
    );

    this.unsubscribe = onSnapshot(q, (snap) => {
      const invites = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as WishlistInvite
      );
      this._invites.set(invites);
    });
  }

  stopListener(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  async invite(email: string, wishlistOwnerId: string, ownerName: string): Promise<void> {
    const col = collection(this.firestore, 'wishlist-invites');
    await addDoc(col, {
      wishlistOwnerId,
      wishlistOwnerName: ownerName,
      invitedEmail: email,
      status: 'pending',
      createdAt: Date.now(),
    } as Omit<WishlistInvite, 'id'>);
  }

  async accept(inviteId: string, wishlistOwnerId: string): Promise<void> {
    const col = collection(this.firestore, 'wishlist-invites');
    await updateDoc(doc(col, inviteId), { status: 'accepted' });
  }

  async decline(inviteId: string): Promise<void> {
    const col = collection(this.firestore, 'wishlist-invites');
    await updateDoc(doc(col, inviteId), { status: 'declined' });
  }
}
