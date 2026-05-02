import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  styles: `
    @keyframes spinner {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes spinnerShrink {
      0%, 100% { stroke-dashoffset: 0; opacity: 1; }
      50% { stroke-dashoffset: 60; opacity: 0.6; }
    }
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
  `,
  template: `
    <div class="spinner" [style.fontSize]="fontSize">
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
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get fontSize() {
    const map: Record<string, string> = {
      sm: 'clamp(16px,2vw,20px)',
      md: 'clamp(24px,3vw,30px)',
      lg: 'clamp(32px,4vw,40px)',
    };
    return map[this.size];
  }
}
