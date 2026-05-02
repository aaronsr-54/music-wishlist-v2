import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import { IconName } from '../../icons/icon-registry';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent],
  host: {
    class:
      'flex flex-col items-center justify-center gap-[10px] px-5 py-[60px] text-center',
    style: 'animation: emptyEnter var(--duration-slow) var(--ease-smooth) both',
  },
  template: `
    @if (icon()) {
      <div class="text-ink-800 dark:text-bone-800 mb-1">
        <app-icon [name]="icon()!" class="w-[3.2rem] h-[3.2rem]" />
      </div>
    }
    <div class="flex flex-col items-center justify-center">
      <p
        class="font-body text-[clamp(1.375rem,1.2707rem+0.4049vw,1.625rem)] font-semibold uppercase text-ink dark:text-bone m-0"
      >
        {{ title() }}
      </p>
      <p
        class="text-[clamp(0.875rem,0.7707rem+0.4049vw,1.125rem)] font-display text-ink-600 dark:text-bone-600 italic m-0 max-w-[240px]"
      >
        {{ subtitle() }}
      </p>
    </div>
    <ng-content />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  icon = input<IconName | null>(null);
  title = input.required<string>();
  subtitle = input.required<string>();
}
