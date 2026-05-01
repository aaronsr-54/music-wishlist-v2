import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
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
