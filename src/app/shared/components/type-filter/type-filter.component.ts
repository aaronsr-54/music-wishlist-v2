import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type FilterType = 'artist' | 'track' | 'album' | 'ep';

export interface TypeFilterOption<T extends string = FilterType> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-type-filter',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex gap-2 overflow-x-auto [animation:slideDown_200ms_var(--ease)_both] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      @for (option of options(); track option.value) {
        <button
          class="px-3 py-1.5 rounded-[20px] border-[1.5px] border-ink-200 bg-transparent text-ink-100 dark:text-bone-600 font-display text-[clamp(0.8125rem,0.7082rem+0.4049vw,1.0625rem)] font-medium whitespace-nowrap cursor-pointer transition-[background,color,border-color] duration-fast ease-smooth hover:border-ink dark:hover:border-bone-600 hover:text-ink dark:hover:text-bone [&.active]:bg-ink [&.active]:border-ink [&.active]:text-bone [&.active]:dark:bg-bone [&.active]:dark:border-bone [&.active]:dark:text-ink"
          [class.active]="selectedTypes().has(option.value)"
          (click)="onToggle(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class TypeFilterComponent<T extends string = FilterType> {
  selectedTypes = input.required<Set<T>>();
  options = input.required<TypeFilterOption<T>[]>();

  toggle = output<T>();

  onToggle(type: T) {
    this.toggle.emit(type);
  }
}