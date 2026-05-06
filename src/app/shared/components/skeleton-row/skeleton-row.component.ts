import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-skeleton-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      50% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .skeleton {
      background: linear-gradient(90deg, rgb(68, 65, 63) 0%, rgb(99, 95, 92) 50%, rgb(68, 65, 63) 100%);
      background-size: 200% 100%;
      animation: shimmer 2s ease-in-out infinite;
      border-radius: 0.375rem;
    }
  `,
  template: `
    <div
      class="flex items-center gap-3 py-[10px]"
      [style.animation]="rowAnimation"
    >
      <div
        class="skeleton flex-shrink-0"
        [style.width.px]="size"
        [style.height.px]="size"
      ></div>
      <div class="flex-1 flex flex-col gap-2">
        <div class="skeleton h-[14px] w-[60%]"></div>
        <div class="skeleton h-3 w-[40%]"></div>
      </div>
    </div>
  `,
})
export class SkeletonRowComponent {
  @Input() size = 56;
  @Input() delay = 0;

  get rowAnimation() {
    return `rowSkeletonEnter 600ms var(--ease) ${this.delay}ms both`;
  }
}
