import { Component, computed, input } from '@angular/core';
import { ReleaseItem } from '../../models/release-item.model';
import { CoverComponent } from '../cover/cover.component';
import { TypeChipComponent } from '../type-chip/type-chip.component';

@Component({
  selector: 'app-card-item',
  standalone: true,
  imports: [CoverComponent, TypeChipComponent],
  template: `
    <div class="card">
      <app-cover
        [coverUrl]="releaseItem().coverUrl"
        [name]="releaseItem().name"
      />
      <div class="item-meta">
        <div class="item-stats">
          <span class="release-date">{{ releaseItem().releaseDate }}</span>
          <app-type-chip [type]="releaseItem().type" />
        </div>
        <div class="item-content">
          <span class="item-title">{{ releaseItem().name }}</span>
          <span class="item-artist">{{ releaseItem().artist }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        display: flex;
        flex-direction: column;
        padding: 8px;
        border-radius: var(--radius-md);
        background: var(--ink-200);
        gap: 4px;
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
      }

      .item-meta {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: 0;
      }

      .item-stats {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--bone-800);
      }

      .item-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .item-title {
        max-width: 100%;
        font-size: 14px;
        font-weight: 600;
        color: var(--bone-100);
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: var(--font-display);
      }

      .item-artist {
        max-width: 100%;
        font-size: 12px;
        color: var(--bone-600);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .release-date {
        font-size: 12px;
        color: var(--bone-600);
        font-family: var(--font-display);
        font-style: italic;
      }
    `,
  ],
})
export class CardItemComponent {
  item = input.required<ReleaseItem>();
  isAdded = input(false);
  showTypeChip = input(true);

  releaseItem = computed(() => {
    return this.item() as ReleaseItem;
  });
}
