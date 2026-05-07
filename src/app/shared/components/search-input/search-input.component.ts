import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex items-center gap-2.5 py-4 border-b border-solid border-bone-100 dark:border-ink-100 transition-[border-color] duration-fast ease-smooth"
      [class.border-bone-600]="query()"
    >
      <app-icon
        name="search"
        class="text-ink-800 dark:text-bone-800 w-6 md:w-7 h-6 md:h-7 shrink-0 "
      />
      <input
        id="search-input"
        type="text"
        [placeholder]="placeholder()"
        [ngModel]="query()"
        (ngModelChange)="onQuery($event)"
        class="flex-1 bg-transparent border-none outline-none text-ink dark:text-bone font-display text-2xl md:text-[1.75rem] font-normal placeholder:text-bone-800 placeholder:italic"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
      @if (query()) {
        <button
          class="bg-transparent border-none cursor-pointer text-ink-600 dark:text-bone-600 p-[0.25em] flex items-center rounded-full transition-colors duration-fast ease-smooth text-sm md:text-lg hover:text-ink dark:hover:text-bone"
          (click)="onClear()"
          [attr.aria-label]="clearLabel()"
        >
          <app-icon name="close" class="w-6 md:w-7 h-6 md:h-7" />
        </button>
      }
    </div>
  `,
})
export class SearchInputComponent {
  query = input.required<string>();
  placeholder = input('');
  clearLabel = input('Clear');

  queryChange = output<string>();
  clear = output<void>();

  onQuery(value: string) {
    this.queryChange.emit(value);
  }

  onClear() {
    this.clear.emit();
  }
}
