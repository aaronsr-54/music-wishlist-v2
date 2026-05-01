import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-profile-account',
  standalone: true,
  template: `
    <section class="px-2 mt-4 pt-4 border-t border-ink-100">
      <h3
        class="font-display text-[clamp(0.6875rem,0.6093rem+0.3036vw,0.875rem)] font-bold text-bone-700 mt-0 mb-3 uppercase tracking-[0.06em]"
      >
        Cuenta
      </h3>

      <button
        (click)="logout()"
        class="w-full py-3 bg-transparent border border-red-600 rounded-card text-red-600 font-display text-sm font-semibold cursor-pointer transition-all duration-fast hover:bg-red-600/10 active:scale-98"
      >
        Cerrar sesión
      </button>
    </section>
  `,
})
export class ProfileAccountComponent {
  auth = inject(AuthService);

  async logout() {
    await this.auth.logout();
  }
}
