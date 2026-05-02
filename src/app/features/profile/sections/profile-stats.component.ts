import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { WishlistService } from '../../../core/firebase/wishlist.service';
import { ProfileSectionComponent } from '../../../shared/components/profile-section/profile-section.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [ProfileSectionComponent, StatCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-profile-section title="Estadísticas">
      <div class="grid grid-cols-[repeat(auto-fit,_minmax(80px,_1fr))] gap-3">
        <app-stat-card
          label="Pendientes"
          [value]="wishlistSvc.pending().length"
        />
        <app-stat-card
          label="Guardadas"
          [value]="wishlistSvc.downloaded().length"
        />
        <app-stat-card label="Total" [value]="wishlistSvc.total()" />
      </div>
    </app-profile-section>
  `,
})
export class ProfileStatsComponent {
  wishlistSvc = inject(WishlistService);
}
