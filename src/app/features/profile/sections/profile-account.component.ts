import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-profile-account',
  standalone: true,
  template: `
    <section class="account-section">
      <h2 class="section-title">Cuenta</h2>

      <button class="logout-btn" (click)="logout()">
        Cerrar sesión
      </button>
    </section>
  `,
  styles: [
    `
      .account-section {
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

      .logout-btn {
        width: 100%;
        padding: 12px;
        background: transparent;
        border: 1px solid #e57373;
        border-radius: var(--radius-card);
        color: #e57373;
        font-family: var(--font-display);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 160ms var(--ease);

        &:hover {
          background: rgba(229, 115, 115, 0.1);
          opacity: 0.88;
        }

        &:active {
          transform: scale(0.98);
        }
      }
    `,
  ],
})
export class ProfileAccountComponent {
  auth = inject(AuthService);

  async logout() {
    await this.auth.logout();
  }
}
