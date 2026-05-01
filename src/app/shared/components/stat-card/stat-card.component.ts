import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col gap-2 p-4 rounded-[var(--radius-card)] text-center border border-ink-200 hover:border-bone-600 transition-colors duration-base group shadow-[0_2px_12px_4px_rgba(0,0,0,0.1)]"
    >
      <span
        class="italic text-xs text-center uppercase font-light text-bone-700 group-hover:text-bone-600 transition-colors duration-base"
      >
        {{ label() }}
      </span>
      <span class="text-2xl font-bold font-display text-bone tracking-tight">
        {{ value() }}
      </span>
    </div>
  `,
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
}
