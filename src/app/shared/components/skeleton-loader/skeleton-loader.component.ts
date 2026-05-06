import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

type LoaderType = 'rows' | 'text' | 'cover';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
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
    }
  `,
  template: `
    <div [class]="containerClass">
      @switch (type) {
        @case ('rows') {
          @for (i of Array(count); track i) {
            <div class="flex gap-3" [style.animation-delay]="i * 30 + 'ms'">
              <div class="skeleton w-14 h-14 rounded-md flex-shrink-0"></div>
              <div class="flex flex-col gap-2 flex-1">
                <div class="skeleton h-[14px] rounded-sm"></div>
                <div class="skeleton h-3 rounded-sm w-[40%]"></div>
              </div>
            </div>
          }
        }
        @case ('text') {
          @for (i of Array(count); track i) {
            <div
              class="skeleton h-[14px] rounded-sm"
              [style.animation-delay]="i * 50 + 'ms'"
              [style.width.%]="85 - i * 5"
            ></div>
          }
        }
        @case ('cover') {
          @for (i of Array(count); track i) {
            <div
              class="skeleton aspect-square rounded-md"
              [style.animation-delay]="i * 40 + 'ms'"
            ></div>
          }
        }
      }
    </div>
  `,
})
export class SkeletonLoaderComponent {
  @Input() type: LoaderType = 'rows';
  @Input() count = 5;

  Array = Array;

  get containerClass() {
    if (this.type === 'cover') {
      return 'grid gap-3 grid-cols-[repeat(auto-fill,minmax(80px,1fr))]';
    }
    return 'flex flex-col gap-3';
  }
}
