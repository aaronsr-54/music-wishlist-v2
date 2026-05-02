import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col h-full overflow-hidden gap-4 bg-bone-300 dark:bg-ink"
    >
      <div
        class="flex items-center justify-between h-16 px-6 shrink-0 gap-4 max-md:h-14 max-md:px-4"
      >
        <button
          class="bg-transparent text-ink-700 dark:text-bone-700 text-md cursor-pointer transition-colors duration-fast hover:text-ink dark:hover:text-bone lowercase"
          (click)="goBack()"
          aria-label="Volver"
        >
          ← Volver
        </button>

        <span
          class="font-display text-md text-ink dark:text-bone font-bold tracking-[0.06em] uppercase"
        >
          <span class="text-ink-700 dark:text-bone-700 font-normal italic"
            >04/</span
          >
          PERFIL
        </span>
      </div>

      @if (auth.currentUser(); as user) {
        <div
          class="py-8 px-4 md:p-8 min-h-full w-full max-w-7xl gap-8 flex flex-col justify-between mx-auto overflow-auto [scrollbar-width:none] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_10px,black_90%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10px,black_90%,transparent_100%)]"
        >
          <section class="flex flex-col gap-12">
            <!-- HERO -->
            <div class="flex gap-4 mb-6 px-2 animate-fade-in">
              <app-avatar
                [name]="user.displayName ?? user.email ?? 'Usuario'"
                [size]="80"
              />

              <div class="flex flex-col justify-center gap-2">
                <h1
                  class="font-display text-xl font-bold text-ink dark:text-bone leading-tight m-0"
                >
                  {{ user.displayName ?? user.email }}
                </h1>

                <p class="text-sm text-ink-600 dark:text-bone-600 m-0">
                  {{ user.email }}
                </p>

                <p class="text-sm text-ink-600 dark:text-bone-600 m-0">
                  {{ user.id }}
                </p>
              </div>
            </div>

            <!-- SECTIONS -->
            <app-profile-stats />
            <app-profile-shared />
            <app-profile-settings />
          </section>

          <!-- ACCOUNT -->
          <app-profile-account />
        </div>
      }
    </div>
  `,
  styles: [
    `
      @keyframes fade-in {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      :host ::ng-deep .animate-fade-in {
        animation: fade-in 0.4s var(--ease-smooth) forwards;
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
