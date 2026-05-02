import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SegmentedTabOption<T extends string = string> {
  value: T;
  label: string;
  prefix?: string;
}

@Component({
  selector: 'app-segmented-tabs',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- nav variant: editorial style with prefixes -->
    @if (variant() === 'nav') {
      <div class="flex flex-col">
        @for (option of options(); track option.value) {
          <button
            class="inline-flex gap-2 text-ink-700 dark:text-bone-700 text-[28px] font-light italic font-display cursor-pointer uppercase transition-[transform,color] duration-fast ease-smooth border-none bg-transparent p-0 hover:scale-[1.01]"
            [class.active]="value() === option.value"
            (click)="valueChange.emit(option.value)"
          >
            @if (option.prefix) {
              <span
                class="w-14 text-right"
                [class.opacity-0]="value() !== option.value"
                >{{ option.prefix }}</span
              >
            }
            <span
              class="shrink [&.active]:text-ink [&.active]:dark:text-bone [&.active]:font-bold [&.active]:not-italic"
              [class.active]="value() === option.value"
              >{{ option.label }}</span
            >
          </button>
        }
      </div>
    }

    <!-- toggle variant: compact pill style -->
    @if (variant() === 'toggle') {
      <div class="p-1 bg-bone dark:bg-ink-200 rounded-pill md:flex-1">
        <div class="flex flex-row gap-1 rounded-pill overflow-hidden">
          @for (option of options(); track option.value) {
            <button
              class="flex-1 py-1 font-body uppercase text-ink-200 dark:text-bone-600 rounded-md [&.active]:bg-ink-200 [&.active]:dark:bg-bone-200 [&.active]:text-bone  [&.active]:dark:text-ink [&.active]:font-bold"
              [class.active]="value() === option.value"
              (click)="valueChange.emit(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class SegmentedTabsComponent<T extends string = string> {
  options = input.required<SegmentedTabOption<T>[]>();
  value = input.required<T>();
  variant = input<'nav' | 'toggle'>('toggle');

  valueChange = output<T>();
}
