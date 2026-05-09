import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col gap-2 p-4 rounded-card text-center border border-bone-800 dark:border-ink-200 transition-colors duration-base shadow-[0_2px_12px_4px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_12px_4px_rgba(0,0,0,0.1)]"
    >
      <span
        class="italic text-xs text-center uppercase font-light text-ink-700 dark:text-bone-700 transition-colors duration-base"
      >
        {{ label() }}
      </span>
      <span
        class="text-2xl font-bold font-display text-ink dark:text-bone tracking-tight"
      >
        {{ value() }}
      </span>
    </div>
  `,
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
}
