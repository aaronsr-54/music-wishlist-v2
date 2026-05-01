import { Component, input } from '@angular/core';

@Component({
  selector: 'app-preview-spinner',
  standalone: true,
  styles: `
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
    .spinner-loading {
      animation: spin 1s linear infinite;
    }
  `,
  template: `
    <div
      class="relative w-full h-full flex items-center justify-center"
      [style.transform]="source() === 'card' ? 'scale(0.7)' : null"
    >
      @if (isLoading()) {
        <svg class="w-1/2 h-1/2 spinner-loading text-bone-100" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.15" />
          <path
            d="M12 2a10 10 0 0110 10"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-dasharray="15.7 50"
          />
        </svg>
      } @else {
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
      }
    </div>
  `,
})
export class PreviewSpinnerComponent {
  progress = input(0);
  isPlaying = input(true);
  isLoading = input(false);
  source = input<'card' | 'default'>('default');

  readonly circumference = 2 * Math.PI * 45;

  strokeDashoffset = (): number => {
    return this.circumference - (this.progress() / 100) * this.circumference;
  };
}
