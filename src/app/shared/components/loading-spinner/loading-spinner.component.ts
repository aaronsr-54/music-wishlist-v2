import {
  Component,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col items-center gap-4 py-10 px-5 text-ink-600 dark:text-bone-600 text-center"
    >
      <app-spinner [size]="size()" />
      @if (message()) {
        <span
          class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] italic"
          >{{ message() }}</span
        >
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  message = input('');
}