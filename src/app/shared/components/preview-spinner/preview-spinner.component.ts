import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preview-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container">
      <svg viewBox="0 0 100 100" class="spinner-ring">
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
      <div class="spinner-center">
        @if (isPlaying()) {
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="3" width="5" height="18" rx="1.5" />
            <rect x="14" y="3" width="5" height="18" rx="1.5" />
          </svg>
        } @else {
          <svg class="icon icon--play" viewBox="0 0 24 24" fill="none">
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
  styles: [
    `
      .spinner-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .spinner-ring {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .spinner-bg {
        fill: none;
        stroke: var(--bone-800);
        stroke-width: 5;
      }

      .spinner-progress {
        fill: none;
        stroke: var(--bone-100);
        stroke-width: 5;
        stroke-linecap: round;
        transition: stroke-dashoffset 100ms linear;
      }

      .spinner-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--bone-100);
      }

      .icon {
        width: 65%;
        height: 65%;
        transition: opacity 200ms ease-in-out;
      }

      .icon--play {
        margin-left: 2px;
      }
    `,
  ],
})
export class PreviewSpinnerComponent {
  progress = input(0); // 0-100
  isPlaying = input(true);

  readonly circumference = 2 * Math.PI * 45;

  strokeDashoffset = (): number => {
    return this.circumference - (this.progress() / 100) * this.circumference;
  };
}
