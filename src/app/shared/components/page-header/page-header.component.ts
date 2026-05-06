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
    <div
      class="flex items-center justify-between gap-2"
      [class.md:hidden]="mobileOnly()"
    >
      @if (showBack()) {
        <button
          class="bg-transparent text-ink-700 dark:text-bone-700 text-md cursor-pointer transition-colors duration-fast hover:text-ink dark:hover:text-bone lowercase"
          (click)="onBack()"
          [attr.aria-label]="backLabel()"
        >
          ← {{ backLabel() }}
        </button>
      }
      <span
        class="font-display text-xs md:text-base text-ink dark:text-bone font-bold tracking-[0.06em] uppercase"
        [class.ml-auto]="showBack()"
      >
        <span
          class="text-ink-700 dark:text-bone-700 font-normal italic lowercase"
          >{{ prefix() }}</span
        >
        {{ title() }}
      </span>
      @if (badge()) {
        <span
          class="font-display text-xs md:text-base text-ink-700 dark:text-bone-700 tracking-[0.06em] italic"
        >
          {{ badge() }}
        </span>
      }
    </div>
  `,
})
export class PageHeaderComponent {
  prefix = input('01/');
  title = input('');
  backLabel = input('back');
  showBack = input(true);
  mobileOnly = input(false);
  badge = input<string | null>(null);

  back = output<void>();

  onBack() {
    this.back.emit();
  }
}
