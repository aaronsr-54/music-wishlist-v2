import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

type ActionButtonVariant = 'primary' | 'danger' | 'secondary';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      [class]="buttonClass()"
      [disabled]="disabled()"
    >
      <ng-content />
    </button>
  `,
})
export class ActionButtonComponent {
  variant = input<ActionButtonVariant>('primary');
  disabled = input(false);

  buttonClass() {
    const base = 'px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary: 'bg-bone-600 text-ink hover:bg-bone transition-colors',
      danger: 'bg-red-600 text-white hover:bg-red-500 transition-colors',
      secondary: 'bg-transparent border border-bone-600 text-bone-600 hover:border-bone hover:text-bone transition-colors',
    };
    return base + ' ' + variants[this.variant()];
  }
}
