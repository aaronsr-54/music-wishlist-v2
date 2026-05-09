import {
  Component,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfileSectionComponent } from '../../../shared/components/profile-section/profile-section.component';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-profile-account',
  standalone: true,
  imports: [ProfileSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-profile-section [divider]="true">
      <button
        (click)="logout()"
        class="w-full py-3 text-ink-700 dark:text-bone-700 font-display text-base font-semibold cursor-pointer transition-colors duration-base hover:text-ink-500 dark:hover:text-bone-500"
      >
        {{ t().closeSession }}
      </button>
    </app-profile-section>
  `,
})
export class ProfileAccountComponent {
  auth = inject(AuthService);
  private languageService = inject(LanguageService);

  t = computed(() => this.languageService.t());

  async logout() {
    await this.auth.logout();
  }
}
