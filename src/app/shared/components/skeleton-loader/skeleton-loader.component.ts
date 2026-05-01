import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type LoaderType = 'rows' | 'text' | 'cover';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClass">
      @switch (type) {
        @case ('rows') {
          @for (i of Array(count); track i) {
            <div class="skeleton-item" [style.animation-delay]="i * 30 + 'ms'">
              <div class="skeleton skeleton--cover skeleton-item__cover"></div>
              <div class="skeleton-item__lines">
                <div class="skeleton skeleton--text skeleton-item__line--title"></div>
                <div class="skeleton skeleton--line skeleton-item__line--sub"></div>
              </div>
            </div>
          }
        }
        @case ('text') {
          @for (i of Array(count); track i) {
            <div
              class="skeleton skeleton--text"
              [style.animation-delay]="i * 50 + 'ms'"
              [style.width.%]="85 - i * 5"
            ></div>
          }
        }
        @case ('cover') {
          @for (i of Array(count); track i) {
            <div
              class="skeleton skeleton--cover skeleton-loader__cover"
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
