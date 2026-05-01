import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-profile-account',
  standalone: true,
  template: `
    <section class="mb-8">
      <h2
        class="font-display text-[clamp(0.6875rem,0.6093rem+0.3036vw,0.875rem)] font-bold text-bone-700 mt-0 mb-3 uppercase tracking-[0.06em] px-2"
      >
        Cuenta
      </h2>

      <button
        (click)="logout()"
        class="w-full px-3 py-3 bg-transparent border border-red-600 rounded-card text-red-600 font-display text-sm font-semibold cursor-pointer transition-all duration-fast hover:opacity-90 hover:bg-red-600/10 active:scale-98"
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
