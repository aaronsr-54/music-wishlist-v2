import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SegmentedTabOption } from '../segmented-tabs/segmented-tabs.component';

@Component({
  selector: 'app-modal-options',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-1 bg-ink-200 dark:bg-ink-700 rounded-2xl">
      <div class="flex flex-col gap-1">
        @for (option of options(); track option.value) {
          <button
            class="w-full py-2 px-4 font-body uppercase text-ink-600 dark:text-bone-600 rounded-lg transition-colors duration-200 [&.active]:bg-bone dark:[&.active]:bg-bone [&.active]:text-ink [&.active]:font-bold"
            [class.active]="value() === option.value"
            (click)="valueChange.emit(option.value)"
          >
            {{ option.label }}
          </button>
        }
      </div>
    </div>
  `,
})
export class ModalOptionsComponent<T extends string = string> {
  options = input.required<SegmentedTabOption<T>[]>();
  value = input.required<T>();

  valueChange = output<T>();
}
