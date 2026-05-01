import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { WishlistInviteService } from '../../../core/firebase/wishlist-invite.service';

@Component({
  selector: 'app-profile-shared',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="shared-section">
      <h2 class="section-title">Social</h2>

      <div class="invite-box">
        <h3 class="subsection-title">Invitar amigos</h3>
        <div class="invite-form">
          <input
            type="email"
            placeholder="Email del amigo"
            class="invite-input"
            [(ngModel)]="emailInput"
            (keyup.enter)="inviteUser()"
            [disabled]="loading()"
          />
          <button
            class="invite-btn"
            (click)="inviteUser()"
            [disabled]="loading()"
          >
            {{ loading() ? 'Enviando...' : 'Enviar invitación' }}
          </button>
        </div>
        @if (inviteMessage()) {
          <p class="invite-message" [class.success]="inviteSuccess()">
            {{ inviteMessage() }}
          </p>
        }
      </div>

      <div class="shared-list">
        <h3 class="subsection-title">Invitaciones enviadas</h3>
        @if (sentInvites().length === 0) {
          <p class="empty-state">Aún no has invitado a nadie</p>
        } @else {
          <ul class="users-list">
            @for (invite of sentInvites(); track invite.id) {
              <li class="user-item">
                <div class="user-info">
                  <span class="user-email">{{ invite.invitedEmail }}</span>
                  <span class="invite-status" [class]="invite.status">
                    {{ getStatusLabel(invite.status) }}
                  </span>
                </div>
              </li>
            }
          </ul>
        }
      </div>

      @if (pendingInvites().length > 0) {
        <div class="pending-invites">
          <h3 class="subsection-title">Invitaciones pendientes</h3>
          <ul class="invites-list">
            @for (invite of pendingInvites(); track invite.id) {
              <li class="invite-item">
                <div class="invite-info">
                  <span class="owner-name">{{ invite.wishlistOwnerName }}</span>
                  <span class="owner-email">{{ invite.wishlistOwnerId }}</span>
                </div>
                <div class="invite-actions">
                  <button
                    class="accept-btn"
                    (click)="acceptInvite(invite.id!)"
                    [disabled]="loading()"
                  >
                    Aceptar
                  </button>
                  <button
                    class="decline-btn"
                    (click)="declineInvite(invite.id!)"
                    [disabled]="loading()"
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            }
          </ul>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .shared-section {
        margin-bottom: 32px;
      }

      .section-title {
        font-family: var(--font-display);
        font-size: 16px;
        font-weight: 600;
        color: var(--bone);
        margin: 0 0 16px 0;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .subsection-title {
        font-family: var(--font-body);
        font-size: 14px;
        font-weight: 600;
        color: var(--bone);
        margin: 0 0 12px 0;
      }

      .invite-box {
        background: var(--ink-100);
        padding: 16px;
        border-radius: var(--radius-card);
        margin-bottom: 20px;
      }

      .invite-form {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;

        @media (max-width: 480px) {
          flex-direction: column;
        }
      }

      .invite-input,
      .invite-btn {
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .invite-input {
        flex: 1;
        padding: 10px 12px;
        background: var(--ink-200);
        border: 1px solid var(--ink-300);
        border-radius: var(--radius-md);
        color: var(--bone);
        font-size: 14px;
        font-family: var(--font-body);

        &::placeholder {
          color: var(--bone-600);
        }

        &:focus {
          outline: none;
          border-color: var(--bone);
        }
      }

      .invite-btn {
        padding: 10px 16px;
        background: var(--bone);
        color: var(--ink);
        border: none;
        border-radius: var(--radius-md);
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: opacity 160ms var(--ease);

        &:hover:not(:disabled) {
          opacity: 0.88;
        }

        &:active:not(:disabled) {
          opacity: 0.8;
        }
      }

      .invite-message {
        font-size: 13px;
        margin: 8px 0 0 0;
        padding: 8px 0;

        &.success {
          color: #81c784;
        }

        &:not(.success) {
          color: #e57373;
        }
      }

      .shared-list,
      .pending-invites {
        background: var(--ink-100);
        padding: 16px;
        border-radius: var(--radius-card);
        margin-bottom: 20px;
      }

      .empty-state {
        font-size: 14px;
        color: var(--bone-600);
        margin: 0;
        text-align: center;
        padding: 16px 0;
      }

      .users-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .user-item {
        padding: 10px 12px;
        background: var(--ink-200);
        border-radius: var(--radius-md);
        font-size: 14px;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .user-email {
        color: var(--bone);
      }

      .invite-status {
        font-size: 12px;
        text-transform: uppercase;
        font-weight: 600;

        &.pending {
          color: #ffa726;
        }

        &.accepted {
          color: #81c784;
        }

        &.declined {
          color: #e57373;
        }
      }

      .invites-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .invite-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: var(--ink-200);
        border-radius: var(--radius-md);
        gap: 12px;

        @media (max-width: 480px) {
          flex-direction: column;
          align-items: flex-start;
        }
      }

      .invite-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
      }

      .owner-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--bone);
      }

      .owner-email {
        font-size: 12px;
        color: var(--bone-600);
      }

      .invite-actions {
        display: flex;
        gap: 8px;

        @media (max-width: 480px) {
          width: 100%;
          gap: 4px;
        }
      }

      .accept-btn,
      .decline-btn {
        padding: 8px 12px;
        border: none;
        border-radius: var(--radius-md);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 160ms var(--ease);

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        &:hover:not(:disabled) {
          opacity: 0.88;
        }
      }

      .accept-btn {
        background: #81c784;
        color: var(--ink);
      }

      .decline-btn {
        background: #e57373;
        color: white;
      }
    `,
  ],
})
export class ProfileSharedComponent {
  private auth = inject(AuthService);
  private inviteService = inject(WishlistInviteService);

  emailInput = '';
  inviteMessage = signal('');
  inviteSuccess = signal(false);
  loading = signal(false);

  sentInvites = signal<any[]>([]);
  pendingInvites = () => this.inviteService.pending();

  async inviteUser() {
    if (!this.emailInput.trim()) return;

    this.loading.set(true);
    try {
      const user = this.auth.currentUser();
      if (!user) return;

      await this.inviteService.invite(
        this.emailInput,
        user.uid,
        user.displayName || user.email || 'Usuario'
      );

      this.inviteMessage.set(`Invitación enviada a ${this.emailInput}`);
      this.inviteSuccess.set(true);
      this.emailInput = '';

      setTimeout(() => {
        this.inviteMessage.set('');
      }, 3000);
    } catch (error) {
      this.inviteMessage.set('Error al enviar invitación');
      this.inviteSuccess.set(false);
    } finally {
      this.loading.set(false);
    }
  }

  async acceptInvite(inviteId: string) {
    this.loading.set(true);
    try {
      const user = this.auth.currentUser();
      if (!user) return;

      await this.inviteService.accept(inviteId, user.uid);
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

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      accepted: 'Aceptada',
      declined: 'Rechazada',
    };
    return labels[status] || status;
  }
}
