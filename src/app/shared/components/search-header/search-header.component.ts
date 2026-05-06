import {
  Component,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between gap-2">
      <span
        class="font-display text-[clamp(0.75rem,0.6457rem+0.4049vw,1rem)] text-ink dark:text-bone font-bold tracking-[0.06em] uppercase md:hidden"
      >
        <span class="text-ink-700 dark:text-bone-700 font-normal italic"
          >{{ prefix }}</span
        >
        {{ title }}
      </span>
    </div>
  `,
})
export class SearchHeaderComponent {
  prefix = input('02/');
  title = input('BUSCADOR');
}