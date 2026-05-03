import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { WishlistService } from '../../../core/firebase/wishlist.service';
import { ProfileSectionComponent } from '../../../shared/components/profile-section/profile-section.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [ProfileSectionComponent, StatCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-profile-section [title]="t().stats">
      <div class="grid grid-cols-[repeat(auto-fit,_minmax(80px,_1fr))] gap-3">
        <app-stat-card
          [label]="t().pending"
          [value]="wishlistSvc.pending().length"
        />
        <app-stat-card
          [label]="t().saved"
          [value]="wishlistSvc.downloaded().length"
        />
        <app-stat-card [label]="t().total" [value]="wishlistSvc.total()" />
      </div>
    </app-profile-section>
  `,
})
export class ProfileStatsComponent {
  wishlistSvc = inject(WishlistService);
  private languageService = inject(LanguageService);

  t = computed(() => this.languageService.t());
}
