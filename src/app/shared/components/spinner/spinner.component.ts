import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="spinner" [class]="sizeClass">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="2"
          stroke-dasharray="62.8"
          stroke-dashoffset="0"
          opacity="0.3"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="2"
          stroke-dasharray="31.4"
          stroke-dashoffset="0"
          stroke-linecap="round"
          class="spinner-arc"
        />
      </svg>
    </div>
  `,
  styles: [`
    .spinner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      animation: spinner 1.2s linear infinite;
    }

    .spinner svg {
      width: 1em;
      height: 1em;
    }

    .spinner-arc {
      animation: spinnerShrink 1.2s ease-in-out infinite;
    }

    .spinner--sm {
      font-size: 16px;
    }

    .spinner--md {
      font-size: 24px;
    }

    .spinner--lg {
      font-size: 32px;
    }

    @keyframes spinner {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes spinnerShrink {
      0%, 100% {
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dashoffset: 31.4;
      }
    }
  `]
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get sizeClass() {
    return `spinner--${this.size}`;
  }
}
