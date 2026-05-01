import { Component, inject } from '@angular/core';
import { WishlistService } from '../../../core/firebase/wishlist.service';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  template: `
    <section class="stats-section">
      <h2 class="section-title">Estadísticas</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Total</span>
          <span class="stat-value">{{ wishlistSvc.total() }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Pendientes</span>
          <span class="stat-value">{{ wishlistSvc.pending().length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Descargadas</span>
          <span class="stat-value">{{ wishlistSvc.downloaded().length }}</span>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .stats-section {
        margin-bottom: 32px;
      }

      .section-title {
        font-family: var(--font-display);
        font-size: 16px;
        font-weight: 600;
        color: var(--bone);
        margin: 0 0 16px 0;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 12px;
      }

      .stat-card {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 12px;
        background: var(--ink-200);
        border-radius: var(--radius-card);
        text-align: center;
      }

      .stat-label {
        font-size: 11px;
        color: var(--bone-600);
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }

      .stat-value {
        font-family: var(--font-display);
        font-size: 20px;
        font-weight: 700;
        color: var(--bone);
      }
    `,
  ],
})
export class ProfileStatsComponent {
  wishlistSvc = inject(WishlistService);
}
