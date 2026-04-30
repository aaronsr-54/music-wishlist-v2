import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preview-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container">
      <svg viewBox="0 0 100 100" class="spinner-ring">
        <circle
          cx="50"
          cy="50"
          r="45"
          class="spinner-bg"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          class="spinner-progress"
          [style.stroke-dashoffset]="strokeDashoffset()"
        />
      </svg>
      <div class="spinner-center">
        <svg class="play-icon" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 3l14 9-14 9V3z"
            fill="currentColor"
          />
        </svg>
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
        stroke: var(--ink-100);
        stroke-width: 2;
      }

      .spinner-progress {
        fill: none;
        stroke: var(--bone);
        stroke-width: 2;
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
        color: var(--bone);
      }

      .play-icon {
        width: 40%;
        height: 40%;
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }
    `,
  ],
})
export class PreviewSpinnerComponent {
  progress = input(0); // 0-100

  strokeDashoffset = (): number => {
    const circumference = 2 * Math.PI * 45;
    return circumference - (this.progress() / 100) * circumference;
  };
}
