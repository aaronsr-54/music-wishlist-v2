import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between gap-2">
      @if (showBack()) {
        <button
          class="bg-transparent text-ink-700 dark:text-bone-700 text-md cursor-pointer transition-colors duration-fast hover:text-ink dark:hover:text-bone lowercase"
          (click)="onBack()"
          [attr.aria-label]="backLabel()"
        >
          ← {{ backLabel() }}
        </button>
      } @else {
        <span></span>
      }
      <span
        class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink dark:text-bone font-bold tracking-[0.06em] uppercase"
      >
        <span
          class="text-ink-700 dark:text-bone-700 font-normal italic lowercase"
          >{{ prefix() }}</span
        >
        {{ title() }}
      </span>
    </div>
  `,
})
export class PageHeaderComponent {
  prefix = input('01/');
  title = input('');
  backLabel = input('back');
  showBack = input(true);

  back = output<void>();

  onBack() {
    this.back.emit();
  }
}