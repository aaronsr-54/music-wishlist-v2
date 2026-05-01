import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    <header class="flex items-center justify-between h-16 px-6 shrink-0 gap-4 max-md:h-14 max-md:px-4">
      <h1 class="font-display text-[clamp(1.5rem,1.3957rem+0.4049vw,1.75rem)] font-bold leading-[0.8] m-0 tracking-[-0.03em] bg-linear-to-br from-bone from-[60%] to-bone-600 bg-clip-text text-transparent">
        Music <span class="font-light italic">Wishlist</span>.
      </h1>

      <div class="min-w-40 flex justify-end max-md:min-w-0">
        @if (user(); as u) {
          <button
            class="bg-transparent border-none cursor-pointer p-0 rounded-full transition-opacity duration-fast ease-smooth hover:opacity-80"
            (click)="openProfile.emit()"
            title="Abrir perfil"
          >
            <app-avatar [name]="u.displayName ?? u.email ?? 'U'" [size]="32" />
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
}
