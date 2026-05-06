import {
  Component,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export type SearchEmptyStateVariant = 'idle' | 'empty';

@Component({
  selector: 'app-search-empty-state',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scroll-fade">
      @switch (variant()) {
        @case ('idle') {
          <app-empty-state
            icon="search"
            [title]="title()"
            [subtitle]="subtitle()"
          />
        }
        @case ('empty') {
          <app-empty-state
            [icon]="null"
            [title]="title()"
            [subtitle]="subtitle()"
          />
        }
      }
    </div>
  `,
})
export class SearchEmptyStateComponent {
  variant = input.required<SearchEmptyStateVariant>();
  title = input('');
  subtitle = input('');
}