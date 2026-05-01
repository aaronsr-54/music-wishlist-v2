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
    <div class="panel">
      <div class="eyebrow">
        <button
          class="bg-transparent text-bone-700 text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] cursor-pointer transition-colors duration-fast hover:text-bone"
          (click)="goBack()"
          aria-label="Volver"
        >
          ← Volver
        </button>

        <span
          class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-bone font-bold tracking-[0.06em] uppercase"
        >
          <span class="text-bone-700 font-normal italic">04/</span> PERFIL
        </span>
      </div>

      @if (auth.currentUser(); as user) {
        <div class="scroll-fade">
          <!-- HERO -->
          <div class="flex gap-4 pb-6 mb-6 px-2">
            <app-avatar
              [name]="user.displayName ?? user.email ?? 'Usuario'"
              [size]="80"
            />

            <div class="flex flex-col justify-center gap-2">
              <h1
                class="font-display text-xl font-bold text-bone leading-tight m-0"
              >
                {{ user.displayName ?? user.email }}
              </h1>

              <p class="text-sm text-bone-600 m-0">
                {{ user.email }}
              </p>
            </div>
          </div>

          <!-- SECTIONS -->
          <app-profile-stats />
          <app-profile-shared />
          <app-profile-settings />

          <!-- ACCOUNT -->
          <app-profile-account />
        </div>
      }
    </div>
  `,
})
export class ProfileComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  goBack() {
    this.router.navigate(['/']);
  }
}
