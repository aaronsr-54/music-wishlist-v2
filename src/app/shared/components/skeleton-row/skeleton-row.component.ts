import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-row',
  standalone: true,
  template: `
    <div class="row" [style.animation-delay]="delay + 'ms'">
      <div class="cover skeleton skeleton--cover" [style.width.px]="size" [style.height.px]="size"></div>
      <div class="lines">
        <div class="skeleton skeleton--text line-title"></div>
        <div class="skeleton skeleton--line line-sub"></div>
      </div>
    </div>
  `,
  styles: [`
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      animation: rowSkeletonEnter 600ms var(--ease) both;
    }

    .cover {
      flex-shrink: 0;
    }

    .lines {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .line-title {
      width: 60%;
    }

    .line-sub {
      width: 40%;
    }

    @keyframes rowSkeletonEnter {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class SkeletonRowComponent {
  @Input() size = 56;
  @Input() delay = 0;
}
