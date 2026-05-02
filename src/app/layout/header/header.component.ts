import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme/theme.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../shared/icons/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AvatarComponent, IconComponent],
  template: `
    <header
      class="flex items-center justify-between h-16 px-6 shrink-0 gap-4 max-md:h-14 max-md:px-4"
    >
      <h1
        class="font-display text-[clamp(1.5rem,1.3957rem+0.4049vw,1.75rem)] font-bold leading-[0.8] m-0 tracking-[-0.03em] text-ink dark:text-bone"
      >
        Music <span class="font-light italic">Wishlist</span>.
      </h1>

      <div class="min-w-40 flex justify-end items-center gap-3 max-md:min-w-0">
        <button
          class="bg-transparent border-none cursor-pointer p-2 rounded-full transition-colors duration-fast ease-smooth hover:bg-bg-secondary text-text-primary"
          (click)="theme.toggleTheme()"
          title="Cambiar tema"
        >
          @if (theme.isDarkMode()) {
            <app-icon name="sun" class="w-5 h-5 text-ink dark:text-bone" />
          } @else {
            <app-icon name="moon" class="w-5 h-5 text-ink dark:text-bone" />
          }
        </button>
        @if (user(); as u) {
          <button
            class="bg-transparent border-none cursor-pointer p-0 rounded-full transition-opacity duration-fast ease-smooth hover:opacity-80"
            (click)="openProfile.emit()"
            title="Abrir perfil"
          >
            <app-avatar [name]="u.displayName ?? u.email ?? 'U'" [size]="34" />
          </button>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Output() openProfile = new EventEmitter<void>();

  private auth = inject(AuthService);
  user = this.auth.currentUser;

  theme = inject(ThemeService);
}
