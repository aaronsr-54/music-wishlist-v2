import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-row',
  standalone: true,
  template: `
    <div
      class="flex items-center gap-3 py-[10px]"
      [style.animation]="rowAnimation"
    >
      <div
        class="skeleton skeleton--cover shrink-0"
        [style.width.px]="size"
        [style.height.px]="size"
      ></div>
      <div class="flex-1 flex flex-col gap-2">
        <div class="skeleton skeleton--text w-[60%]"></div>
        <div class="skeleton skeleton--line w-[40%]"></div>
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
