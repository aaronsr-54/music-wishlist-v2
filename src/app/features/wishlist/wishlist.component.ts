import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { WishlistService } from '../../core/firebase/wishlist.service';
import { WishlistEntry } from '../../shared/models/wishlist-entry.model';
import { CoverComponent } from '../../shared/components/cover/cover.component';
import { TypeChipComponent } from '../../shared/components/type-chip/type-chip.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

type WishlistTab = 'pending' | 'downloaded';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [DatePipe, CoverComponent, TypeChipComponent, AvatarComponent],
  template: `
    <div class="panel">
      <div class="eyebrow">
        <span class="label"
          ><span class="label--number">02/</span> WISHLIST</span
        >
        <span class="eyebrow-sub">{{ wishlistSvc.total() }} elementos</span>
      </div>

      <div class="segmented">
        <button
          class="seg-btn"
          [class.active]="activeTab() === 'pending'"
          (click)="activeTab.set('pending')"
        >
          Pendientes
          @if (wishlistSvc.pending().length > 0) {
            <span class="count">{{ wishlistSvc.pending().length }}</span>
          }
        </button>
        <button
          class="seg-btn"
          [class.active]="activeTab() === 'downloaded'"
          (click)="activeTab.set('downloaded')"
        >
          Descargados
          @if (wishlistSvc.downloaded().length > 0) {
            <span class="count">{{ wishlistSvc.downloaded().length }}</span>
          }
        </button>
      </div>

      <div class="list">
        @for (entry of activeEntries(); track entry.id) {
          <div class="wishlist-row">
            <app-cover
              [coverUrl]="entry.coverUrl"
              [name]="entry.name"
              [size]="64"
            />
            <div class="item-meta">
              <span class="item-title">{{ entry.name }}</span>
              <span class="item-subitle">
                <span class="item-artist">{{ entry.artist }}</span>
                ·
                <app-type-chip [type]="entry.type" />
              </span>
              <span class="added-by">
                <app-avatar [name]="entry.addedBy" [size]="14" />
                {{ entry.addedBy }} ·
                <span class="added-date">{{
                  entry.addedAt | date: 'd MMM'
                }}</span>
              </span>
            </div>
            <div class="actions">
              @if (activeTab() === 'pending') {
                <button
                  class="action-btn"
                  (click)="markDownloaded(entry)"
                  title="Marcar como descargado"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5L6.5 12L13 5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <button
                  class="action-btn action-danger"
                  (click)="remove(entry)"
                  title="Eliminar"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 4L12 12M12 4L4 12"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              } @else {
                <button
                  class="action-btn"
                  (click)="unmarkDownloaded(entry)"
                  title="Mover a pendientes"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M10 4L6 8L10 12"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
                <button
                  class="action-btn action-danger"
                  (click)="remove(entry)"
                  title="Eliminar"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M5 3h6M3 5h10M5 5v7a1 1 0 001 1h4a1 1 0 001-1V5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <div class="empty-icon">
              @if (activeTab() === 'pending') {
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M16 4v24M4 16h24"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              } @else {
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M6 17L13 24L26 8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              }
            </div>
            @if (activeTab() === 'pending') {
              <p class="empty-title">Tu wishlist espera</p>
              <p class="empty-sub">Busca canciones y añádelas aquí</p>
            } @else {
              <p class="empty-title">Nada descargado</p>
              <p class="empty-sub">
                Marca canciones como descargadas para verlas aquí
              </p>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        padding: 0.5rem 1rem;
        gap: 1rem;
      }

      .eyebrow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .label {
        font-family: var(--font-display);
        font-size: 12px;
        color: var(--bone);
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .label--number {
        color: var(--bone-700);
        font-weight: 400;
        font-style: italic;
      }

      .eyebrow-sub {
        font-family: var(--font-display);
        font-size: 12px;
        color: var(--bone-700);
        letter-spacing: 0.06em;
        font-style: italic;
      }

      .segmented {
        display: flex;
        gap: 4px;
        padding: 4px;
        background: var(--ink-200);
        border-radius: var(--radius-pill);
      }

      .seg-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: var(--radius-pill);
        border: none;
        background: none;
        color: var(--bone-600);
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--dur-fast) var(--ease);
        text-transform: uppercase;
      }

      .seg-btn.active {
        background: var(--bone);
        color: var(--ink);
        font-weight: 700;
      }

      .count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: var(--radius-pill);
        background: var(--ink-100);
        color: var(--bone-600);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .seg-btn.active .count {
        background: var(--ink-300);
      }

      .list {
        flex: 1;
        overflow-y: auto;
        padding: 4px 20px 16px;
      }

      .wishlist-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 8px;
        border-bottom: 1px solid var(--ink-200);
        border-radius: var(--radius-md);
        margin: 0 -8px;
        transition: background var(--dur-fast) var(--ease);
      }

      .wishlist-row:last-child {
        border-bottom: none;
      }

      .item-meta {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }

      .item-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--bone-100);
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        height: 18px;
        text-overflow: ellipsis;
        font-family: var(--font-display);
      }

      .item-subtitle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bone-800);
      }

      .item-artist {
        font-size: 13px;
        color: var(--bone-600);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        height: 15px;
      }

      .added-by {
        font-size: 11px;
        color: var(--bone-800);
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
        font-weight: 600;
      }

      .added-date {
        font-family: var(--font-display);
        font-weight: 400;
        font-style: italic;
      }

      .actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      .action-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1.5px solid var(--ink-100);
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bone-600);
        transition: all var(--dur-fast) var(--ease);
      }

      .action-btn:hover {
        border-color: var(--bone-400);
        color: var(--bone);
      }

      .action-btn.action-danger:hover {
        border-color: #e57373;
        color: #e57373;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 60px 20px;
        text-align: center;
      }

      .empty-icon {
        color: var(--bone-700);
        margin-bottom: 4px;
      }

      .empty-title {
        font-family: var(--font-body);
        font-size: 22px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--bone);
        margin: 0;
      }

      .empty-sub {
        font-size: 14px;
        font-family: var(--font-display);
        color: var(--bone-600);
        font-style: italic;
        margin: 0;
        max-width: 240px;
      }
    `,
  ],
})
export class WishlistComponent {
  wishlistSvc = inject(WishlistService);
  activeTab = signal<WishlistTab>('pending');

  activeEntries = computed(() =>
    this.activeTab() === 'pending'
      ? this.wishlistSvc.pending()
      : this.wishlistSvc.downloaded(),
  );

  async markDownloaded(entry: WishlistEntry) {
    if (entry.id) await this.wishlistSvc.markDownloaded(entry.id);
  }

  async unmarkDownloaded(entry: WishlistEntry) {
    if (entry.id) await this.wishlistSvc.unmarkDownloaded(entry.id);
  }

  async remove(entry: WishlistEntry) {
    if (entry.id) await this.wishlistSvc.remove(entry.id);
  }
}
