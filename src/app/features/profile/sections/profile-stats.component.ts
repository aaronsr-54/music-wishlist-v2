import { Component, inject } from '@angular/core';
import { WishlistService } from '../../../core/firebase/wishlist.service';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  template: `
    <section class="mb-8">
      <h2
        class="font-display text-[clamp(0.6875rem,0.6093rem+0.3036vw,0.875rem)] font-bold text-bone-700 mt-0 mb-3 uppercase tracking-[0.06em] px-2"
      >
        Estadísticas
      </h2>
      <div class="grid grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))] gap-3">
        <div
          class="flex flex-col gap-2 p-3 rounded-lg text-center border border-ink-200"
        >
          <span class="italic text-xs uppercase font-light text-bone-700"
            >Pendientes</span
          >
          <span class="text-xl font-bold font-display text-bone">{{
            wishlistSvc.pending().length
          }}</span>
        </div>
        <div
          class="flex flex-col gap-2 p-3 rounded-lg text-center border border-ink-200"
        >
          <span class="italic text-xs uppercase font-light text-bone-700"
            >Guardadas</span
          >
          <span class="text-xl font-bold font-display text-bone">{{
            wishlistSvc.downloaded().length
          }}</span>
        </div>
        <div
          class="flex flex-col gap-2 p-3 rounded-lg text-center border border-ink-200"
        >
          <span class="italic text-xs uppercase font-light text-bone-700"
            >Total</span
          >
          <span class="text-xl font-bold font-display text-bone">{{
            wishlistSvc.total()
          }}</span>
        </div>
      </div>
    </section>
  `,
})
export class ProfileStatsComponent {
  wishlistSvc = inject(WishlistService);
}
