import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfileSectionComponent } from '../../../shared/components/profile-section/profile-section.component';

@Component({
  selector: 'app-profile-account',
  standalone: true,
  imports: [ProfileSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-profile-section [divider]="true">
      <button
        (click)="logout()"
        class="w-full py-3 mb-20 text-ink-700 dark:text-bone-700 font-display text-base font-semibold cursor-pointer transition-colors duration-base hover:text-ink-500 dark:hover:text-bone-500"
      >
        Cerrar sesión
      </button>
    </app-profile-section>
  `,
})
export class ProfileAccountComponent {
  auth = inject(AuthService);

  async logout() {
    await this.auth.logout();
  }
}
