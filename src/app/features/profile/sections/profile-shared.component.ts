import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  onSnapshot,
  orderBy,
} from '@angular/fire/firestore';
import { AuthService } from '../../../core/auth/auth.service';
import { WishlistInviteService } from '../../../core/firebase/wishlist-invite.service';
import { WishlistInvite } from '../../../shared/models/wishlist-invite.model';
import { IconComponent } from '../../../shared/icons/icon.component';

@Component({
  selector: 'app-profile-shared',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <section class="px-2 mb-6">
      <h3
        class="font-display text-[clamp(0.6875rem,0.6093rem+0.3036vw,0.875rem)] font-bold text-bone-700 mt-0 mb-3 uppercase tracking-[0.06em]"
      >
        Social
      </h3>

      <!-- INVITE BAR -->
      <div class="flex items-center gap-2.5 py-4 border-b border-ink-100 mb-4">
        <app-icon name="mail" class="text-bone-800 w-5 h-5 shrink-0" />
        <input
          type="email"
          placeholder="Invitar a alguien por email"
          [(ngModel)]="emailInput"
          (keyup.enter)="inviteUser()"
          [disabled]="loading()"
          class="flex-1 bg-transparent border-none outline-none text-bone font-display text-base placeholder:text-bone-800 placeholder:italic"
        />
        <button
          (click)="inviteUser()"
          [disabled]="loading()"
          class="text-sm font-semibold text-bone-600 hover:text-bone transition-colors duration-fast cursor-pointer disabled:opacity-50"
        >
          {{ loading() ? 'Enviando' : 'Enviar' }}
        </button>
      </div>

      <!-- SENT INVITES -->
      <div class="mb-4 pb-4">
          <h4 class="text-xs uppercase tracking-wider text-bone-700 mb-3 font-semibold mt-0">
            Invitaciones enviadas
          </h4>
        <div class="flex flex-col">
          @for (invite of sentInvites(); track invite.id) {
            <div class="flex items-center justify-between py-3 border-b border-ink-100/50">
              <div class="flex flex-col min-w-0">
                <span class="text-bone text-sm truncate">
                  {{ invite.invitedEmail }}
                </span>
                <span
                  class="mt-1 text-[11px] uppercase tracking-wider font-semibold w-fit px-2 py-0.5 rounded-full"
                  [class.bg-ink-200]="invite.status === 'pending'"
                  [class.text-orange-400]="invite.status === 'pending'"
                  [class.bg-green-900/20]="invite.status === 'accepted'"
                  [class.text-green-400]="invite.status === 'accepted'"
                  [class.bg-red-900/20]="invite.status === 'declined'"
                  [class.text-red-400]="invite.status === 'declined'"
                >
                  {{ getStatusLabel(invite.status) }}
                </span>
              </div>
                <div class="flex items-center gap-3">
                  @if (invite.status === 'accepted') {
                    <button
                      (click)="cancelSharing(invite.id!)"
                      class="text-xs text-bone-600 hover:text-bone transition-colors duration-fast cursor-pointer"
                    >
                      quitar
                    </button>
                  }
                  @if (invite.status === 'declined') {
                    <button
                      (click)="inviteUser(invite.invitedEmail)"
                      class="text-xs text-bone hover:underline transition-colors duration-fast cursor-pointer"
                    >
                      reenviar
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

      <!-- PENDING INVITES -->
      @if (pendingInvites().length > 0) {
        <div class="pt-4 border-t border-ink-100">
          <h4 class="text-xs uppercase tracking-wider text-bone-700 mb-3 font-semibold mt-0">
            Pendientes
          </h4>
          <div class="flex flex-col">
            @for (invite of pendingInvites(); track invite.id) {
              <div class="flex items-center justify-between py-3 border-b border-ink-100/50">
                <div class="flex flex-col">
                  <span class="text-bone text-sm font-medium">
                    {{ invite.wishlistOwnerName }}
                  </span>
                  <span class="text-bone-600 text-xs">
                    {{ invite.wishlistOwnerId }}
                  </span>
                </div>
                <div class="flex gap-2">
                  <button
                    (click)="acceptInvite(invite.id!)"
                    class="px-3 py-1 text-sm font-semibold rounded-md bg-green-600 text-ink hover:bg-green-500 transition-colors duration-fast cursor-pointer"
                  >
                    aceptar
                  </button>
                  <button
                    (click)="declineInvite(invite.id!)"
                    class="px-3 py-1 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-500 transition-colors duration-fast cursor-pointer"
                  >
                    rechazar
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </section>
  `,
})
export class ProfileSharedComponent {
  private auth = inject(AuthService);
  private inviteService = inject(WishlistInviteService);
  private firestore = inject(Firestore);

  emailInput = '';
  inviteMessage = signal('');
  inviteSuccess = signal(false);
  loading = signal(false);

  sentInvites = signal<WishlistInvite[]>([]);
  pendingInvites = () => this.inviteService.pending();

  private unsubscribe: (() => void) | null = null;

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.initSentInvitesListener(user.uid);
      } else {
        this.stopSentInvitesListener();
      }
    });
  }

  private initSentInvitesListener(uid: string): void {
    this.stopSentInvitesListener();

    const col = collection(this.firestore, 'wishlist-invites');
    const q = query(
      col,
      where('wishlistOwnerId', '==', uid),
      orderBy('createdAt', 'desc'),
    );

    this.unsubscribe = onSnapshot(q, (snap) => {
      this.sentInvites.set(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WishlistInvite),
      );
    });
  }

  private stopSentInvitesListener(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  async inviteUser(emailUser?: string) {
    if (!this.emailInput.trim() && !emailUser) return;

    const mail = this.emailInput.trim() || emailUser || '';

    this.loading.set(true);

    try {
      const user = this.auth.currentUser();
      if (!user) return;

      await this.inviteService.invite(
        mail,
        user.uid,
        user.displayName || user.email || 'Usuario',
      );

      this.inviteMessage.set(`Invitación enviada a ${mail}`);
      this.inviteSuccess.set(true);
      this.emailInput = '';

      setTimeout(() => this.inviteMessage.set(''), 3000);
    } finally {
      this.loading.set(false);
    }
  }

  async acceptInvite(inviteId: string) {
    this.loading.set(true);

    try {
      const user = this.auth.currentUser();
      if (!user) return;

      const invite = this.inviteService
        .pending()
        .find((i) => i.id === inviteId);

      if (!invite) return;

      await this.inviteService.accept(inviteId, user.uid);

      const wishlistCol = collection(this.firestore, 'wishlist');
      const q = query(
        wishlistCol,
        where('addedByUid', '==', invite.wishlistOwnerId),
      );

      const snapshot = await getDocs(q);

      for (const d of snapshot.docs) {
        const data = d.data();
        const sharedWith = (data['sharedWith'] as string[]) || [];

        if (!sharedWith.includes(user.uid)) {
          sharedWith.push(user.uid);
          await updateDoc(d.ref, { sharedWith });
        }
      }
    } finally {
      this.loading.set(false);
    }
  }

  async declineInvite(inviteId: string) {
    this.loading.set(true);
    try {
      await this.inviteService.decline(inviteId);
    } finally {
      this.loading.set(false);
    }
  }

  async cancelSharing(inviteId: string) {
    this.loading.set(true);
    try {
      await this.inviteService.remove(inviteId);
    } finally {
      this.loading.set(false);
    }
  }

  getStatusLabel(status: string): string {
    return (
      {
        pending: 'Pendiente',
        accepted: 'Aceptada',
        declined: 'Rechazada',
      }[status] || status
    );
  }
}
