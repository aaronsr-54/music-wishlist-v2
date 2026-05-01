import { Component, input } from '@angular/core';

@Component({
  selector: 'app-preview-spinner',
  standalone: true,
  template: `
    <div
      class="relative w-full h-full flex items-center justify-center"
      [style.transform]="source() === 'card' ? 'scale(0.7)' : null"
    >
      <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" class="spinner-bg" />
        <circle
          cx="50"
          cy="50"
          r="40"
          class="spinner-progress"
          [style.stroke-dasharray]="circumference"
          [style.stroke-dashoffset]="strokeDashoffset()"
        />
      </svg>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-bone-100">
        @if (isPlaying()) {
          <svg class="w-[65%] h-[65%] transition-opacity duration-200" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="3" width="5" height="18" rx="1.5" />
            <rect x="14" y="3" width="5" height="18" rx="1.5" />
          </svg>
        } @else {
          <svg class="w-[65%] h-[65%] transition-opacity duration-200 ml-[2px]" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 3l14 9-14 9V3z"
              fill="currentColor"
              stroke="currentColor"
              stroke-width="3"
              stroke-linejoin="round"
            />
          </svg>
        }
      </div>
    </div>
  `,
})
export class PreviewSpinnerComponent {
  progress = input(0);
  isPlaying = input(true);
  source = input<'card' | 'default'>('default');

  readonly circumference = 2 * Math.PI * 45;

  strokeDashoffset = (): number => {
    return this.circumference - (this.progress() / 100) * this.circumference;
  };
}
