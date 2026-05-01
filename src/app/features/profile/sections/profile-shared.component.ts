import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
          />
          <button class="invite-btn" (click)="inviteUser()">
            Enviar invitación
          </button>
        </div>
        @if (inviteMessage()) {
          <p class="invite-message" [class.success]="inviteSuccess()">
            {{ inviteMessage() }}
          </p>
        }
      </div>

      <div class="shared-list">
        <h3 class="subsection-title">Usuarios con acceso</h3>
        @if (sharedUsers().length === 0) {
          <p class="empty-state">Aún no has invitado a nadie</p>
        } @else {
          <ul class="users-list">
            @for (user of sharedUsers(); track user) {
              <li class="user-item">
                <span class="user-email">{{ user }}</span>
                <button
                  class="remove-btn"
                  (click)="removeUser(user)"
                  title="Revocar acceso"
                >
                  ✕
                </button>
              </li>
            }
          </ul>
        }
      </div>
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

        &:hover {
          opacity: 0.88;
        }

        &:active {
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

      .shared-list {
        background: var(--ink-100);
        padding: 16px;
        border-radius: var(--radius-card);
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
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        background: var(--ink-200);
        border-radius: var(--radius-md);
        font-size: 14px;
      }

      .user-email {
        color: var(--bone);
        flex: 1;
      }

      .remove-btn {
        background: transparent;
        border: none;
        color: var(--bone-600);
        cursor: pointer;
        font-size: 16px;
        padding: 4px 8px;
        transition: color 160ms var(--ease);

        &:hover {
          color: #e57373;
        }
      }
    `,
  ],
})
export class ProfileSharedComponent {
  emailInput = '';
  inviteMessage = () => '';
  inviteSuccess = () => false;
  sharedUsers = () => ['ejemplo@gmail.com', 'amigo@gmail.com'];

  inviteUser() {
    if (!this.emailInput.trim()) return;

    // TODO: implementar lógica de invitación
    this.inviteMessage = () => `Invitación enviada a ${this.emailInput}`;
    this.inviteSuccess = () => true;
    this.emailInput = '';

    setTimeout(() => {
      this.inviteMessage = () => '';
    }, 3000);
  }

  removeUser(email: string) {
    // TODO: implementar lógica de remoción
    console.log('Revocar acceso a', email);
  }
}
