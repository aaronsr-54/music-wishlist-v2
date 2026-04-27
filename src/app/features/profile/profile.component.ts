import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    <div class="profile-panel">
      <div class="eyebrow">
        <span class="eyebrow-label">03/ Mi Perfil</span>
      </div>

      <div class="profile-content">
        @if (auth.currentUser(); as user) {
          <div class="profile-header">
            <app-avatar [name]="user.displayName ?? user.email ?? 'Usuario'" [size]="80" />
            <div class="profile-info">
              <h1 class="profile-name">{{ user.displayName ?? user.email }}</h1>
              <p class="profile-email">{{ user.email }}</p>
            </div>
          </div>

          <div class="stats">
            <div class="stat-card">
              <span class="stat-label">Wishlist Total</span>
              <span class="stat-value">{{ wishlistSvc.total() }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Pendientes</span>
              <span class="stat-value">{{ wishlistSvc.pending().length }}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Descargados</span>
              <span class="stat-value">{{ wishlistSvc.downloaded().length }}</span>
            </div>
          </div>

          <button class="logout-btn" (click)="logout()">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 17H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5M13 5l3 3m0 0l-3 3M16 8H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Cerrar sesión
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .eyebrow {
      padding: 20px 20px 12px;
      border-bottom: 1px solid var(--ink-200);
    }

    .eyebrow-label {
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 600;
      color: var(--bone);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .profile-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .profile-header {
      display: flex;
      gap: 20px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--ink-200);
    }

    .profile-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
    }

    .profile-name {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      color: var(--bone);
      margin: 0;
      line-height: 1.2;
    }

    .profile-email {
      font-size: 13px;
      color: var(--bone-600);
      margin: 0;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 16px;
      background: var(--ink-200);
      border-radius: var(--radius-card);
      text-align: center;
    }

    .stat-label {
      font-size: 11px;
      color: var(--bone-600);
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .stat-value {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
      color: var(--bone);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 24px;
      border-radius: var(--radius-pill);
      background: #e57373;
      color: white;
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
      align-self: flex-start;
    }

    .logout-btn:hover {
      opacity: 0.88;
      transform: translateY(-1px);
    }

    .logout-btn:active {
      transform: translateY(0);
    }
  `]
})
export class ProfileComponent {
  auth = inject(AuthService);
  wishlistSvc = inject(WishlistService);

  async logout() {
    await this.auth.logout();
  }
}
