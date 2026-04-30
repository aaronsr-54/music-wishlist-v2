import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type LoaderType = 'rows' | 'text' | 'cover';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-loader" [class]="'skeleton-loader--' + type">
      @switch (type) {
        @case ('rows') {
          @for (i of Array(count); track i) {
            <div class="skeleton-item" [style.animation-delay]="i * 30 + 'ms'">
              <div class="skeleton skeleton--cover skeleton-item__cover"></div>
              <div class="skeleton-item__lines">
                <div class="skeleton skeleton--text skeleton-item__line skeleton-item__line--title"></div>
                <div class="skeleton skeleton--line skeleton-item__line skeleton-item__line--sub"></div>
              </div>
            </div>
          }
        }
        @case ('text') {
          @for (i of Array(count); track i) {
            <div class="skeleton skeleton--text" [style.animation-delay]="i * 50 + 'ms'" [style.width.%]="85 - i * 5"></div>
          }
        }
        @case ('cover') {
          @for (i of Array(count); track i) {
            <div class="skeleton skeleton--cover skeleton-loader__cover" [style.animation-delay]="i * 40 + 'ms'"></div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .skeleton-loader {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skeleton-loader--cover {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 12px;
    }

    .skeleton-item {
      display: flex;
      gap: 12px;
      animation: rowSkeletonEnter 600ms var(--ease) both;
    }

    .skeleton-item__cover {
      width: 56px;
      height: 56px;
      flex-shrink: 0;
    }

    .skeleton-item__lines {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-item__line {
      height: 12px;
    }

    .skeleton-item__line--title {
      height: 14px;
      width: 60%;
    }

    .skeleton-item__line--sub {
      width: 40%;
    }

    .skeleton-loader__cover {
      width: 100%;
      aspect-ratio: 1;
      animation: rowSkeletonEnter 600ms var(--ease) both;
    }

    .skeleton {
      animation: shimmer 2s ease-in-out infinite;
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

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      50% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: LoaderType = 'rows';
  @Input() count = 5;

  Array = Array;
}
