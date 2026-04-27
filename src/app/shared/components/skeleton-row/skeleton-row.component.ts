import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-row',
  standalone: true,
  template: `
    <div class="row">
      <div class="cover skeleton" [style.width.px]="size" [style.height.px]="size"></div>
      <div class="lines">
        <div class="skeleton line-title"></div>
        <div class="skeleton line-sub"></div>
      </div>
    </div>
  `,
  styles: [`
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
    }
    .cover { border-radius: var(--radius-md); flex-shrink: 0; }
    .lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .line-title { height: 14px; width: 60%; border-radius: var(--radius-sm); }
    .line-sub   { height: 12px; width: 40%; border-radius: var(--radius-sm); }
  `]
})
export class SkeletonRowComponent {
  @Input() size = 56;
}
