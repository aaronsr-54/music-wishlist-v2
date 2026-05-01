import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { ProfileAccountComponent } from './sections/profile-account.component';
import { ProfileStatsComponent } from './sections/profile-stats.component';
import { ProfileSharedComponent } from './sections/profile-shared.component';
import { ProfileSettingsComponent } from './sections/profile-settings.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    AvatarComponent,
    ProfileAccountComponent,
    ProfileStatsComponent,
    ProfileSharedComponent,
    ProfileSettingsComponent,
  ],
  template: `
    <div class="profile-page">
      <header class="profile-header">
        <button class="back-btn" (click)="goBack()" aria-label="Volver">
          ← Volver
        </button>
        <span class="label"><span class="label--number">04/</span> PERFIL</span>
      </header>

      @if (auth.currentUser(); as user) {
        <main class="profile-content">
          <!-- Header con avatar -->
          <div class="profile-hero">
            <app-avatar
              [name]="user.displayName ?? user.email ?? 'Usuario'"
              [size]="100"
            />
            <div class="profile-info">
              <h1 class="profile-name">
                {{ user.displayName ?? user.email }}
              </h1>
              <p class="profile-email">{{ user.email }}</p>
            </div>
          </div>

          <!-- Stats -->
          <app-profile-stats />

          <!-- Wishlist compartidas -->
          <app-profile-shared />

          <!-- Configuración -->
          <app-profile-settings />

          <!-- Account -->
          <app-profile-account />
        </main>
      }
    </div>
  `,
  styles: [
    `
      .profile-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        padding: 0;
      }

      .profile-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 16px;
        border-bottom: 1.5px solid var(--ink-100);

        @media (min-width: 768px) {
          padding: 24px;
        }
      }

      .back-btn {
        background: none;
        border: none;
        color: var(--bone);
        cursor: pointer;
        font-size: 14px;
        padding: 8px;
        transition: opacity 160ms var(--ease);

        &:hover {
          opacity: 0.7;
        }
      }

      .label {
        font-family: var(--font-display);
        font-size: 12px;
        color: var(--bone);
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        flex: 1;
      }

      .label--number {
        color: var(--bone-700);
        font-weight: 400;
        font-style: italic;
      }

      .profile-content {
        flex: 1;
        padding: 24px 16px;
        max-width: 800px;
        margin: 0 auto;
        width: 100%;

        @media (min-width: 768px) {
          padding: 32px 24px;
        }
      }

      .profile-hero {
        display: flex;
        gap: 20px;
        padding-bottom: 24px;
        margin-bottom: 24px;
        border-bottom: 1.5px solid var(--ink-100);
      }

      .profile-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
      }

      .profile-name {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 700;
        color: var(--bone);
        margin: 0;
        line-height: 1.2;
      }

      .profile-email {
        font-size: 14px;
        color: var(--bone-600);
        margin: 0;
      }
    `,
  ],
})
export class ProfileComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  goBack() {
    this.router.navigate(['/']);
  }
}
