import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-section',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      @if (title()) {
        <h3
          class="font-display text-sm font-bold text-ink-700 dark:text-bone-700 mt-0 mb-4 uppercase tracking-[0.06em]"
        >
          {{ title() }}
        </h3>
      }
      <ng-content />
    </section>
  `,
})
export class ProfileSectionComponent {
  title = input<string>();
  divider = input(false);
}
